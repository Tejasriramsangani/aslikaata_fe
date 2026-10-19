/**
 * ASLI KAATA API Client - Admin Web Platform
 * Configured with automatic JWT Bearer injection, 401 refresh token rotation,
 * and real-time backend server downtime detection.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: string | null;
  timestamp: string;
}

type ServerStatusListener = (isDown: boolean, details?: string) => void;

class ApiClient {
  private statusListeners: Set<ServerStatusListener> = new Set();
  public isServerDown: boolean = false;
  public lastErrorDetails: string = '';

  public onServerStatusChange(listener: ServerStatusListener) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(isDown: boolean, details?: string) {
    this.isServerDown = isDown;
    if (details) this.lastErrorDetails = details;
    this.statusListeners.forEach((fn) => fn(isDown, details));
  }

  public async checkHealth(): Promise<boolean> {
    const rootUrl = BASE_URL.replace(/\/api\/v1\/?$/, '');
    try {
      const res = await fetch(`${rootUrl}/health`, { method: 'GET', cache: 'no-store' });
      if (res.ok) {
        this.notifyStatus(false);
        return true;
      }
    } catch {
      try {
        const fallback = await fetch(`${BASE_URL}/catalog/rates`, { method: 'GET', cache: 'no-store' });
        if (fallback.ok) {
          this.notifyStatus(false);
          return true;
        }
      } catch {}
    }
    this.notifyStatus(true, 'Operations server unreachable');
    return false;
  }

  public getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('aslikaata_admin_access_token') ||
      localStorage.getItem('aslikaata_customer_access_token')
    );
  }

  public getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return (
      localStorage.getItem('aslikaata_admin_refresh_token') ||
      localStorage.getItem('aslikaata_customer_refresh_token')
    );
  }

  public setAdminTokens(accessToken: string, refreshToken?: string, profile?: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aslikaata_admin_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('aslikaata_admin_refresh_token', refreshToken);
    }
    if (profile) {
      localStorage.setItem('aslikaata_admin_profile', JSON.stringify(profile));
    }
  }

  public getAdminProfile(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('aslikaata_admin_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  public clearAdminTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('aslikaata_admin_access_token');
    localStorage.removeItem('aslikaata_admin_refresh_token');
    localStorage.removeItem('aslikaata_admin_profile');
  }

  private setTokens(accessToken: string, refreshToken?: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('aslikaata_customer_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('aslikaata_customer_refresh_token', refreshToken);
    }
  }

  public clearTokens() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('aslikaata_customer_access_token');
    localStorage.removeItem('aslikaata_customer_refresh_token');
    localStorage.removeItem('aslikaata_customer_profile');
    this.clearAdminTokens();
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        this.clearTokens();
        return null;
      }

      const json: ApiResponse<{ accessToken: string; refreshToken?: string }> = await res.json();
      if (json.success && json.data.accessToken) {
        this.setTokens(json.data.accessToken, json.data.refreshToken);
        return json.data.accessToken;
      }
    } catch {
      this.clearTokens();
    }
    return null;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status >= 502 && response.status <= 504) {
        this.notifyStatus(true, `HTTP ${response.status}: Server Maintenance`);
      } else if (this.isServerDown && response.status < 500) {
        this.notifyStatus(false);
      }

      if (response.status === 401 && !isRetry) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
          return this.request<T>(endpoint, { ...options, headers }, true);
        }
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (err: any) {
      const errorMsg = err.message || 'Network request failed';
      if (
        errorMsg.includes('Failed to fetch') ||
        errorMsg.includes('NetworkError') ||
        errorMsg.includes('fetch failed') ||
        errorMsg.includes('Network request failed')
      ) {
        this.notifyStatus(true, errorMsg);
      }

      return {
        success: false,
        data: null as any,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      };
    }
  }

  public get<T = any>(endpoint: string, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, headers?: HeadersInit) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: HeadersInit) {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  // --- 100% Dynamic Admin Endpoints ---

  public getTodayAnalytics() {
    return this.get('/admin/analytics/today');
  }

  public listAdminPickups(status?: string, date?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (date) params.append('date', date);
    const qs = params.toString();
    return this.get(`/admin/pickups${qs ? `?${qs}` : ''}`);
  }

  public assignPickup(pickupId: string, employeeProfileId: string, vehicleId?: string) {
    return this.post(`/admin/pickups/${pickupId}/assign`, {
      employeeProfileId,
      vehicleId,
    });
  }

  public cancelPickup(pickupId: string, reason: string) {
    return this.post(`/admin/pickups/${pickupId}/cancel`, { reason });
  }

  public getFullCatalog() {
    return this.get('/catalog');
  }

  public getCategories() {
    return this.get('/catalog/categories');
  }

  public getProducts(categoryId?: string) {
    return this.get(`/catalog/products${categoryId ? `?categoryId=${categoryId}` : ''}`);
  }

  public setProductRate(dto: { productId: string; ratePerKgPaise: number; effectiveFrom?: string }) {
    return this.post('/admin/catalog/rates', dto);
  }

  public seedDefaultCatalog() {
    return this.post('/admin/catalog/seed');
  }

  public listVehicles() {
    return this.get('/admin/vehicles');
  }

  public createVehicle(data: {
    registrationNumber: string;
    name: string;
    vehicleType: string;
    capacityKg: number;
    maxStops: number;
    defaultEmployeeId?: string;
  }) {
    return this.post('/admin/vehicles', data);
  }

  public deleteVehicle(id: string) {
    return this.delete(`/admin/vehicles/${id}`);
  }

  public listEmployees(status?: string) {
    return this.get(`/admin/employees${status ? `?status=${status}` : ''}`);
  }

  public listHolidays() {
    return this.get('/admin/holidays');
  }

  public createHoliday(data: { name: string; date: string; type?: string }) {
    return this.post('/admin/holidays', data);
  }

  public listRouteSchedules() {
    return this.get('/admin/route-schedules');
  }

  public getAuditLogs(params?: Record<string, string>) {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return this.get(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
  }
}

export const apiClient = new ApiClient();
