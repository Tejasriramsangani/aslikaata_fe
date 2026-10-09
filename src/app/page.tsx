"use client";

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LocationProvider, useLocation, LocationData } from '../context/LocationContext';
import { TopAppBar } from '../components/layout/TopAppBar';
import { BottomNavbar, NavTab } from '../components/layout/BottomNavbar';
import { OnboardingCarousel } from '../components/onboarding/OnboardingCarousel';
import { LocationPermissionScreen } from '../components/location/LocationPermissionScreen';
import { LocationBottomSheetModal } from '../components/location/LocationBottomSheetModal';
import { LoginScreen } from '../components/auth/LoginScreen';
import { OtpVerificationScreen } from '../components/auth/OtpVerificationScreen';
import { PersonalizationScreen } from '../components/auth/PersonalizationScreen';
import { HeroPromoCarousel } from '../components/home/HeroPromoCarousel';
import { TodayScrapRatesPreview } from '../components/home/TodayScrapRatesPreview';
import { OurApproachSection } from '../components/home/OurApproachSection';
import { BulkDisposalCard } from '../components/home/BulkDisposalCard';
import { GreenerTomorrowSection } from '../components/home/GreenerTomorrowSection';
import { ScrapRatesScreen } from '../components/catalog/ScrapRatesScreen';
import { PickupBookingProvider } from '../context/PickupBookingContext';
import { BookingWizardModal } from '../components/booking/BookingWizardModal';
import { PickupDetailsScreen } from '../components/tracking/PickupDetailsScreen';
import { MyPickupsScreen } from '../components/pickups/MyPickupsScreen';
import { ProfileScreen } from '../components/profile/ProfileScreen';
import { BrandLogo } from '../components/common/BrandLogo';
import { apiClient } from '../lib/api-client';
import { Scale, LogOut, Package, ArrowRight, RefreshCw, Calendar, Clock, Sparkles } from 'lucide-react';

type AppFlowStep = 'loading' | 'onboarding' | 'location' | 'login' | 'otp' | 'personalize' | 'app';

function CustomerApp() {
  const [currentStep, setCurrentStep] = useState<AppFlowStep>('loading');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [pendingPhone, setPendingPhone] = useState<string>('');
  const [selectedPickupForDetails, setSelectedPickupForDetails] = useState<any | null>(null);
  const [myPickups, setMyPickups] = useState<any[]>([]);
  const [isLoadingPickups, setIsLoadingPickups] = useState(false);

  const { location, isSheetOpen, closeSheet, setLocation } = useLocation();
  const { user, logout } = useAuth();

  const loadCustomerPickups = React.useCallback(async () => {
    setIsLoadingPickups(true);
    try {
      const res = await apiClient.get('/customer/pickups');
      if (res.success && Array.isArray(res.data)) {
        setMyPickups(res.data);
      }
    } catch {
      // keep fallback
    } finally {
      setIsLoadingPickups(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'pickups') {
      loadCustomerPickups();
    }
  }, [activeTab, loadCustomerPickups]);

  useEffect(() => {
    try {
      const onboarded = localStorage.getItem('aslikaata_onboarded');
      const locationSet = localStorage.getItem('aslikaata_location_set');
      const storedToken = localStorage.getItem('aslikaata_customer_access_token');

      if (onboarded !== 'true') {
        setCurrentStep('onboarding');
      } else if (locationSet !== 'true') {
        setCurrentStep('location');
      } else if (!storedToken) {
        setCurrentStep('login');
      } else {
        setCurrentStep('app');
      }
    } catch {
      setCurrentStep('onboarding');
    }
  }, []);

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem('aslikaata_onboarded', 'true');
    } catch {}
    setCurrentStep('location');
  };

  const handleLocationConfirmed = (selectedLoc: LocationData) => {
    try {
      localStorage.setItem('aslikaata_location_set', 'true');
    } catch {}
    setLocation(selectedLoc);

    const token = localStorage.getItem('aslikaata_customer_access_token');
    if (token) {
      setCurrentStep('app');
    } else {
      setCurrentStep('login');
    }
  };

  const handleOtpSent = (phone: string) => {
    setPendingPhone(phone);
    setCurrentStep('otp');
  };

  const handleOtpVerified = (isNewUser: boolean) => {
    if (isNewUser) {
      setCurrentStep('personalize');
    } else {
      setCurrentStep('app');
    }
  };

  const handlePersonalizationComplete = () => {
    setCurrentStep('app');
  };

  // Splash Loading
  if (currentStep === 'loading') {
    return (
      <div className="w-full h-screen bg-[#0A3D2B] flex flex-col items-center justify-center text-white">
        <BrandLogo variant="light" size="xl" className="animate-pulse" />
      </div>
    );
  }

  // Phase 1: Onboarding Carousel Walkthrough (Image 1)
  if (currentStep === 'onboarding') {
    return <OnboardingCarousel onComplete={handleOnboardingComplete} />;
  }

  // Phase 2: Location Gate (Image 2 - Screens 1 & 2)
  if (currentStep === 'location') {
    return <LocationPermissionScreen onLocationConfirmed={handleLocationConfirmed} />;
  }

  // Phase 3: Mobile Number Login (Image 2 - Screen 3)
  if (currentStep === 'login') {
    return (
      <LoginScreen
        onBack={() => setCurrentStep('location')}
        onOtpSent={handleOtpSent}
      />
    );
  }

  // Phase 3: 6-Digit OTP Verification (Image 2 - Screen 4)
  if (currentStep === 'otp') {
    return (
      <OtpVerificationScreen
        mobileNumber={pendingPhone}
        onBack={() => setCurrentStep('login')}
        onEditMobile={() => setCurrentStep('login')}
        onSuccess={handleOtpVerified}
      />
    );
  }

  // Phase 3: Name Personalization (Image 2 - Screen 5)
  if (currentStep === 'personalize') {
    return (
      <PersonalizationScreen
        onBack={() => setCurrentStep('app')}
        onComplete={handlePersonalizationComplete}
      />
    );
  }

  // Phase 6: Live Pickup Details & Tracking (Image 4 Screens 1, 2, 3)
  if (selectedPickupForDetails) {
    return (
      <PickupDetailsScreen
        initialPickup={
          typeof selectedPickupForDetails === 'object'
            ? selectedPickupForDetails
            : null
        }
        pickupId={
          typeof selectedPickupForDetails === 'object'
            ? selectedPickupForDetails._id || selectedPickupForDetails.id
            : undefined
        }
        onBack={() => setSelectedPickupForDetails(null)}
        onPickupCancelled={() => {
          setSelectedPickupForDetails(null);
          loadCustomerPickups();
        }}
      />
    );
  }

  // Main App Shell (Phases 0, 4, 5, 6, 7)
  return (
    <div className="w-full h-full min-h-screen bg-[#F8FAFC] flex flex-col justify-between relative overflow-hidden">
      {/* Top App Bar with Location Chip (Hidden during booking wizard) */}
      {activeTab !== 'request' && (
        <TopAppBar
          onNotificationClick={() => alert("No new notifications at this time.")}
          unreadNotifications={0}
        />
      )}

      {/* Main Content Area based on Tab */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24 no-scrollbar">
        {/* TAB 1: HOME (Screens 6 & 7) */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* User Welcome Pill */}
            {user?.fullName && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800">Hello, {user.fullName} 👋</p>
                    <p className="text-[10px] text-slate-400">+91 {user.mobileNumber}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Verified Customer
                </span>
              </div>
            )}

            {/* 1. Hero Promo Banner Carousel (Screen 6) */}
            <HeroPromoCarousel
              areaName={location.areaName}
              onBookPickup={() => setActiveTab('request')}
            />

            {/* 2. Today's Scrap Rates Preview (Screen 6) */}
            <TodayScrapRatesPreview
              onViewAll={() => setActiveTab('rates')}
            />

            {/* 3. Our Approach — Simple. Transparent. Reliable. (Screen 7) */}
            <OurApproachSection />

            {/* 4. Bulk Scrap Disposal Card (Screen 7) */}
            <BulkDisposalCard
              onBookBulk={() => setActiveTab('request')}
            />

            {/* 5. Together For A Greener Tomorrow (Screen 7) */}
            <GreenerTomorrowSection />

            {/* Quick Testing Links */}
            <div className="pt-2 border-t border-slate-200/60 text-center">
              <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
                <button
                  onClick={() => setCurrentStep('login')}
                  className="hover:text-slate-700 underline"
                >
                  Test Login (Phase 3)
                </button>
                <span>•</span>
                <button
                  onClick={() => setCurrentStep('location')}
                  className="hover:text-slate-700 underline"
                >
                  Location Gate (Phase 2)
                </button>
                <span>•</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('aslikaata_onboarded');
                    setCurrentStep('onboarding');
                  }}
                  className="hover:text-slate-700 underline"
                >
                  Walkthrough (Phase 1)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCRAP RATES CATALOG (Screen 8) */}
        {activeTab === 'rates' && (
          <ScrapRatesScreen
            areaName={location.areaName}
            onBookPickup={() => setActiveTab('request')}
          />
        )}

        {/* TAB 3: REQUEST PICKUP WIZARD (Image 3) */}
        {activeTab === 'request' && (
          <BookingWizardModal
            onClose={() => setActiveTab('home')}
            onGoToPickups={(pickup) => {
              setSelectedPickupForDetails(pickup || true);
              setActiveTab('pickups');
            }}
            onGoToHome={() => setActiveTab('home')}
          />
        )}

        {/* TAB 4: MY PICKUPS HUB (Image 5) */}
        {activeTab === 'pickups' && (
          <MyPickupsScreen
            onOpenPickupDetails={(pickup) => setSelectedPickupForDetails(pickup)}
            onRequestNewPickup={() => setActiveTab('request')}
          />
        )}

        {/* TAB 5: PROFILE & SETTINGS (Screen 10) */}
        {activeTab === 'profile' && (
          <ProfileScreen
            onEditName={() => setCurrentStep('personalize')}
            onLogout={() => {
              logout();
              setCurrentStep('login');
            }}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Manual Locality Selection Bottom Sheet Modal */}
      <LocationBottomSheetModal
        isOpen={isSheetOpen}
        onClose={closeSheet}
        onSelectLocation={(newLoc) => setLocation(newLoc)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LocationProvider>
        <PickupBookingProvider>
          <CustomerApp />
        </PickupBookingProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
