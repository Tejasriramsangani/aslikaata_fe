# ASLI KAATA: Admin Web Operations Cockpit & ERP Implementation Tasks

This document defines the complete architectural design, UI/UX specification, data schemas, API contracts, and phased implementation tasks for the **ASLI KAATA Admin Web Platform (`admin_web_fe` / `aslikaata_admin`)**.

---

## 1. Executive Summary & Architectural Scope

The Admin Web Platform is the **Central Operations Cockpit and Enterprise Resource Planning (ERP) Hub** of ASLI KAATA. It orchestrates all physical and digital operations across scrap buying, logistics, workforce, inventory, and financial realization.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 ASLI KAATA OPERATIONS COCKPIT                                    │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
       │                                  │                                   │
       ▼                                  ▼                                   ▼
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  PRICING & MARGINS   │       │  FLEET & LOGISTICS   │       │ INWARD SCRAP INTAKE  │
│ • Live Market Rates  │       │ • Owned vs Rented    │       │ • Field Pickups      │
│ • Dynamic Margin ±   │       │ • Maintenance & Fuel │       │ • Yard Gate Drops    │
│ • Customer Sync      │       │ • Route Runs & Auto  │       │ • B2B / Bulk Cleanout│
└──────────────────────┘       └──────────────────────┘       └──────────────────────┘
       │                                  │                                   │
       ▼                                  ▼                                   ▼
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  WORKFORCE & HRM     │       │ HOLIDAY CALENDAR     │       │ OUTWARD DISPATCH     │
│ • Drivers & Laborers │       │ • Predefined Holidays│       │ • Mill / Smelter Sale│
│ • Daily Cash Float   │       │ • Auto-Shift Routes  │       │ • Unit Economics     │
│ • Attendance & Wage  │       │ • Weekly Plan Matrix │       │ • Net P&L Realization│
└──────────────────────┘       └──────────────────────┘       └──────────────────────┘
```

---

## 2. Design System & UI/UX Principles for Operations Cockpit

The Admin Portal is a high-density, real-time command center designed for fast decision-making, minimal cognitive load, and immediate operational visibility.

### 2.1 Color Tokens & Visual Language
* **Primary Brand Green**: `#0A3D2B` (Forest Operations Deep)
* **Interactive Emerald**: `#10B981` / `#059669`
* **Surface Background Canvas**: `#0F172A` (Slate Dark Mode) or `#F8FAFC` (Clean Crisp Light Mode with dark sidebar)
* **Surface Containers**: `#FFFFFF` (Elevated White Cards with 1px `#E2E8F0` borders)
* **Alert & Metric Accents**:
  * Positive Margin / Profit: `#16A34A` (Emerald Green)
  * Negative Margin / Cost: `#DC2626` (Ruby Red)
  * In-Transit / Active Route: `#0284C7` (Sky Blue)
  * Pending Approval / Unassigned Alert: `#F59E0B` (Amber Warning)
  * Yard Inventory Baled / Processed: `#8B5CF6` (Violet Processing)

### 2.2 Layout Hierarchy
* **Sidebar Navigation (Left)**: Fixed 260px with collapsed 72px mode. Grouped into:
  1. *Operations*: Live Dispatch, Pickups Queue, Yard Inward Gate, Route Runs.
  2. *Commercials*: Live Scrap Rates & Margin Engine, Outward Dispatches, Recycler Contracts.
  3. *Logistics & Fleet*: Vehicle Registry, Fuel & Maintenance, Driver Logs.
  4. *HRM & Workforce*: Pickers, Drivers, Yard Labor, Attendance, Cash Floats.
  5. *Planning*: Holiday Calendar, Divisions, Route Schedules, Order Rules.
  6. *Intelligence*: Financial P&L, Audit Trails, Fraud & Discrepancy Alerts.
* **Header Bar (Top)**: Global division selector (Vijayawada East, West, etc.), quick search (`Ctrl+K` for Pickup/Vehicle/Employee), live WebSocket connectivity pulse, active unassigned pickups badge, notification drawer, Admin profile.
* **Workspace Body**: 12-column responsive layout, data tables with virtualization, sticky headers, bulk action bars, drawer side-panels for entity details.

---

## 3. Core Functional Modules & Detailed Specifications

### Module 1: Real-Time Scrap Rates & Dynamic Margin Engine (`Market Rate ± Margin`)
#### Business Purpose & High-Level Mechanics:
Customer rates must stay synchronized with wholesale commodity benchmarks (smelter/mandi spot rates) while protecting operating margins.
* **Market Benchmark Rate ($R_{\text{market}}$)**: The wholesale spot rate per kg at which ASLI KAATA can sell processed scrap to paper mills, plastic pelletizers, or iron foundries.
* **Margin Delta ($\Delta M$)**:
  * Admin configures margin as either **Flat Value (₹/kg)** or **Percentage (%)**.
  * **Negative Margin (Buying Mode - Recommended)**: $R_{\text{customer}} = R_{\text{market}} - \Delta M$. (e.g., Copper smelter sells at ₹650/kg, admin sets -₹40/kg margin $\rightarrow$ Customer buying rate is ₹610/kg).
  * **Positive Margin (Selling / Incentive Mode)**: $R_{\text{customer}} = R_{\text{market}} + \Delta M$ (e.g., Promo campaigns to attract high-grade bulk scrap).
* **Tiered Weight Multipliers**: Automatic adjustment for bulk volumes (e.g., > 100 kg receives +₹1.50/kg bonus).
* **Instant Customer Catalog Propagation**: One-click broadcast with scheduled activation (e.g., effective immediately or tomorrow 6:00 AM).

#### Data Model (`scraprates_v2`):
```typescript
interface ScrapRateConfig {
  _id: string;
  productId: string; // Ref: ScrapProduct
  categoryId: string; // Ref: ScrapCategory
  commodityBenchmark: {
    marketName: string; // e.g. "Hyderabad Mandi", "Vizag Steel Spot"
    marketRatePerKg: number; // in integer paise (e.g. 65000 = ₹650.00)
    lastMarketUpdate: Date;
    sourceUrlOrNote?: string;
  };
  marginConfig: {
    type: 'FLAT_RUPEES' | 'PERCENTAGE';
    direction: 'SUBTRACT' | 'ADD'; // SUBTRACT = buying below market; ADD = premium
    valuePaiseOrBps: number; // e.g. 4000 = ₹40.00/kg or 600 = 6.00%
  };
  calculatedCustomerRatePerKg: number; // in integer paise (shown in customer app)
  bulkIncentives: Array<{
    minKg: number;
    premiumPaisePerKg: number; // e.g. +₹1.50/kg for >100kg
  }>;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  changeReason: string;
  updatedBy: string; // Admin User ID
}
```

---

### Module 2: Fleet & Vehicle Logistics Management (Owned vs Rented)
#### Business Purpose:
Total tracking of every collection vehicle (Ape auto, Tata Ace, Electric 3-wheeler, Pickup truck) to accurately calculate per-kg transportation cost.
* **Vehicle Registry**:
  * **OWNED**: Asset acquisition value, depreciation rate, registration number, chassis/engine no, FC (Fitness Certificate) expiry alert, Comprehensive Insurance expiry alert, Pollution (PUC) alert.
  * **RENTED**: Vendor/Owner name, contact, monthly or daily contract rent, billing frequency, per-km excess charge, driver included or self-driven.
* **Fuel & Energy Log**:
  * Fuel type (Diesel, CNG, Electric EV Charging).
  * Fuel volume (liters / kWh), Rate per unit, Total Cost, Meter reading (odometer), Digital fuel bill image upload.
  * Automatic mileage calculation (km/liter or km/charge) and fuel theft/abnormal consumption alerts.
* **Preventive & Breakdown Maintenance**:
  * Service category (Routine oil change, tire replacement, brake service, battery health).
  * Garage/Mechanic name, work description, parts invoiced, total repair cost, vehicle downtime hours.
* **Incidentals & Extra Route Expenses**:
  * Toll plaza fees, municipal parking, vehicle washing, emergency puncture repair, spot inspection fees.

#### Data Model (`vehicles_v2`, `vehicleexpenses`):
```typescript
interface VehicleEntity {
  _id: string;
  registrationNumber: string; // e.g. "AP 16 TX 4021"
  displayName: string; // e.g. "EV Ape Auto - Central 01"
  vehicleType: 'EV_AUTO' | 'DIESEL_AUTO' | 'TATA_ACE' | 'BOLERO_PICKUP' | 'E_RICKSHAW';
  ownershipType: 'OWNED' | 'RENTED';
  ownershipDetails: {
    vendorName?: string;
    vendorPhone?: string;
    rentBillingModel?: 'DAILY_FLAT' | 'MONTHLY_FIXED' | 'PER_TRIP' | 'PER_KM';
    rentalChargePaise: number; // e.g. ₹600/day = 60000 paise
    contractValidUntil?: Date;
    assetValuePaise?: number; // for owned
  };
  capacityKg: number;
  compliance: {
    fitnessValidUntil: Date;
    insuranceValidUntil: Date;
    pucValidUntil: Date;
    lastServiceOdometer: number;
  };
  currentOdometer: number;
  assignedDivisionId?: string;
  defaultDriverId?: string;
  status: 'ACTIVE' | 'IN_MAINTENANCE' | 'OFF_DUTY' | 'DECOMMISSIONED';
}

interface VehicleExpenseRecord {
  _id: string;
  vehicleId: string;
  driverId: string;
  expenseType: 'FUEL' | 'RENT_ACCRUAL' | 'ROUTINE_MAINTENANCE' | 'BREAKDOWN_REPAIR' | 'TOLL_PARKING' | 'INCIDENTAL';
  amountPaise: number;
  odometerReading?: number;
  fuelDetails?: {
    fuelType: 'DIESEL' | 'CNG' | 'ELECTRICITY';
    quantityLitersOrUnits: number;
    ratePerUnitPaise: number;
  };
  receiptPhotoUrl?: string;
  vendorNotes: string;
  incurredAt: Date;
  approvedBy?: string;
}
```

---

### Module 3: Workforce HRM, Daily Cash Floats & Labor Operations
#### Business Purpose:
Management of scrap collectors (pickers), drivers, and yard sorters/weighers with end-to-end financial accountability for physical cash disbursements.
* **Workforce Profile & Roles**:
  * Job Roles: `DRIVER`, `FIELD_COLLECTOR` (Picker), `YARD_SORTER`, `WEIGHBRIDGE_OPERATOR`.
  * KYC Management: Aadhaar card, Driving License verification status, Police verification check, Emergency contacts.
  * Pay Structure: Fixed monthly salary vs Daily wages vs Per-kg incentive commission (e.g. ₹0.50 per kg collected).
* **Morning Cash Float Issuance**:
  * Field pickers paying cash to doorstep customers must carry working capital.
  * Admin issues Cash Float (e.g. ₹15,000) every morning with digital sign-off.
* **Evening Shift Reconciliation**:
  * Formula: $\text{Issued Float} - \text{Cash Paid to Customers (Verified by OTP vouchers)} - \text{Approved Route Expenses} = \text{Remaining Cash Returned}$.
  * Mismatch / shortage triggers discrepancy audit flag on picker profile.
* **Daily Attendance & Punch Log**:
  * Geofenced yard check-in / check-out with selfie or biometric validation.

#### Data Model (`cashfloats`, `employeehrm`):
```typescript
interface DailyCashFloat {
  _id: string;
  date: string; // "YYYY-MM-DD"
  employeeId: string; // Field picker or driver
  issuedByAdminId: string;
  openingFloatPaise: number; // e.g. 1500000 = ₹15,000.00
  issuedAt: Date;
  closingAudit: {
    cashPaidForPickupsPaise: number; // Auto-summed from OTP-verified cash pickups
    routeExpensesPaise: number; // Fuel, tolls recorded on route
    expectedReturnPaise: number;
    actualCashReturnedPaise: number;
    variancePaise: number; // Positive = excess, Negative = shortage
    reconciledAt: Date;
    reconciledByAdminId: string;
    notes?: string;
    status: 'ISSUED' | 'SETTLED' | 'SHORTAGE_FLAGGED' | 'DISPUTED';
  };
}
```

---

### Module 4: Multi-Channel Inward Scrap Intake & Gate Receiving Ledger
#### Business Purpose:
The scrap collection business receives material through multiple distinct channels every day. All channels must converge into a single unified inventory intake ledger.
* **Channel 1: Doorstep Field Pickups (`FIELD_PICKUP`)**:
  * Automated sync from customer app orders completed by field pickers.
  * Carries original Pickup Code (`AKP-XXXX`), customer name, itemized gross/wastage weights.
* **Channel 2: Direct Yard Gate Walk-ins (`YARD_GATE_WALKIN`)**:
  * Local Kabadiwalas, waste pickers, independent aggregators bringing scrap directly to the yard gate on hand-carts, bicycles, or mini-trucks.
  * Admin/Weighbridge desk creates an Instant Gate Inward Ticket:
    1. Select or register walk-in seller (+91 phone or Quick Anonymous ID).
    2. Digital scale integration or manual weighment entry by category/product.
    3. Enter Gross Weight, Tare Weight, and Deduction/Wastage.
    4. Auto-fetch current buying rate from the active Scrap Rate Master.
    5. Instant Cash or UPI Payout Voucher with printed gate receipt.
* **Channel 3: Commercial & B2B Cleanouts (`COMMERCIAL_BULK`)**:
  * Bulk industrial scrap, apartment association dry waste dispatches, corporate e-waste drives.
  * Truck tare weight and gross weight via weighbridge slips.
  * TDS (Tax Deducted at Source) and GST e-Way bill compliance recording.
* **Daily Receiving Dashboard Summary**:
  * Real-time pie chart of intake by Channel (Field vs Gate vs B2B).
  * Category tonnage breakdown (Total Iron MT, Paper MT, Plastic MT, E-Waste MT).
  * Total inward expenditure (Cash paid vs UPI paid).

#### Data Model (`inwardtransactions`):
```typescript
interface InwardIntakeRecord {
  _id: string;
  inwardTicketNumber: string; // e.g. "INW-20261009-0042"
  channel: 'FIELD_PICKUP' | 'YARD_GATE_WALKIN' | 'COMMERCIAL_BULK' | 'INTER_HUB_TRANSFER';
  linkedPickupId?: string; // Optional if from Field Pickup
  sourceParty: {
    partyType: 'CUSTOMER' | 'LOCAL_KABADIWALA' | 'COMMERCIAL_VENDOR';
    name: string;
    phone: string;
    vehicleNumber?: string;
  };
  weighmentDeskOperatorId: string;
  items: Array<{
    categoryId: string;
    productId: string;
    productName: string;
    grossWeightGrams: number;
    wastageGrams: number;
    netWeightGrams: number;
    ratePerKgSnapshot: number; // paise
    amountPaise: number;
  }>;
  totals: {
    totalGrossGrams: number;
    totalWastageGrams: number;
    totalNetGrams: number;
    totalAmountPaise: number;
  };
  settlement: {
    paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
    transactionReference?: string;
    paidAt: Date;
  };
  yardStorageLocation: string; // e.g. "Bay 3 - Heavy Ferrous Iron"
  createdAt: Date;
}
```

---

### Module 5: Holiday Calendar, Route Planning & Automated Weekly Shift
#### Business Purpose:
Implementation of **Context Addendum 1**: Weekly pickups are scheduled according to vehicle-division runs. When a holiday falls on a scheduled weekday, the engine shifts affected orders automatically.
* **Predefined Holiday Calendar UI**:
  * Interactive full-calendar view highlighting national holidays (e.g. Independence Day, Diwali, Sankranti), municipal strike days, or yard maintenance off-days.
  * Holiday Creation Modal:
    * Date selection.
    * Scope: `ALL_VEHICLES`, or specific vehicle/division list.
    * Auto-Shift Rule:
      * `NEXT_WORKING_DAY`: Run moves to the immediate next available non-holiday day.
      * `NEXT_WEEK_SAME_DAY`: Run skips to the same weekday next week.
    * Impact Simulation Preview: Before confirming, system displays: *"This holiday will impact 14 route runs, 86 weekly customer pickups. 86 notifications will be queued."*
* **Route Runs Management Board**:
  * Kanban / Matrix view of Vehicle $\times$ Division $\times$ Weekday.
  * Stop re-ordering via Drag-and-Drop route optimization.
  * Capacity meter (current planned kg vs vehicle maximum capacity kg).

---

### Module 6: Operations R&D Additions (The Missing Scrap ERP Features)

#### 6.1 Yard Inventory Stock Balance (Raw vs Sorted/Baled)
* Scrap purchased at doorstep is raw. It gains value when sorted into clean grades and baled (e.g., cardboard compacted into 500kg bales; copper wire stripped of PVC).
* Inventory States:
  * `RAW_UNSORTED`: Stored as received from collection vehicles.
  * `SORTING_IN_PROGRESS`: Assigned to yard laborers with recorded sorting loss/dust wastage.
  * `READY_FOR_DISPATCH`: Baled/packaged lots ready for mill sale.

#### 6.2 Outward Sales & Dispatch to Recyclers / Smelters
* The revenue engine of ASLI KAATA:
  * Record sales contracts with smelters (e.g., selling 10 MT of Iron to Jindal Steel @ ₹34.50/kg).
  * Outward Gate Pass generation with gross truck weighbridge slips.
  * Payment receipt tracking (Advances, GST invoices, final realization).
* **Gross Margin Calculator**:
  $$\text{Realized Gross Margin} = \text{Outward Mill Sale Value} - (\text{Inward Scrap Cost} + \text{Logistics Expense} + \text{Yard Labor Cost})$$

#### 6.3 Fraud & Anomaly Detection Sentinel
* Automatic red-flag alerts on dashboard for:
  1. *Wastage Outlier*: Wastage deduction entered by employee $> 20\%$ of gross weight.
  2. *Weight Estimation Disconnect*: Estimated 0-10 kg, but measured at > 60 kg.
  3. *Scale Reading Drift*: Sudden weight drop recorded within 10 seconds of tare.
  4. *Distance Anomaly*: QR verification scanned $> 500\text{ meters}$ away from registered customer address coordinates.

---

## 4. Phased Implementation Tasks Breakdown

### Phase 0: Project Setup, Design System & Operations Shell
- [ ] **Task 0.1**: Initialize Next.js 16 + React 19 Admin Web project (`aslikaata_admin` or `admin_fe`) with TypeScript and Tailwind CSS v4.
- [ ] **Task 0.2**: Configure Admin Operations Theme (Deep Forest Green `#0A3D2B`, High-contrast slate data tables, modern cards, glassmorphic floating filter bars).
- [ ] **Task 0.3**: Build Responsive App Shell with collapsible operations sidebar, breadcrumbs, command bar (`Ctrl+K`), and live connection indicator.
- [ ] **Task 0.4**: Implement Admin JWT Authentication, session timeout guards, and Role-Based Route Guards (`SUPER_ADMIN`, `YARD_MANAGER`, `DISPATCHER`, `ACCOUNTANT`).

---

### Phase 1: Real-Time Scrap Rates & Dynamic Margin Engine
- [ ] **Task 1.1**: Build **Market Rates Dashboard** showing live commodity benchmarks across all 6 core categories (Paper, Metal, Plastic, E-Waste, Rubber, Others).
- [ ] **Task 1.2**: Implement **Margin Delta Controller** allowing inline editing of `+` / `-` margin values (Flat ₹ or %) with visual profit impact indicator.
- [ ] **Task 1.3**: Build **Live Customer Rate Simulator**: Displays exactly how the customer app rate card changes in real time when market rate or margin changes.
- [ ] **Task 1.4**: Implement **Bulk Tier Incentive Matrix**: Configure volume bonus premiums (+₹/kg for >50kg, >100kg, >500kg).
- [ ] **Task 1.5**: Implement Rate Versioning Audit Log & Instant Customer Broadcast button with WebSocket push notification dispatch.

---

### Phase 2: Fleet & Vehicle Logistics Management
- [ ] **Task 2.1**: Build **Vehicle Registry Management**:
  - Filterable grid of all fleet assets (EV Autos, Tata Ace, Diesel Pickups).
  - Clear visual badge distinction: `🟢 OWNED` vs `🟡 RENTED`.
  - Detailed side-drawer with FC, Insurance, PUC expiry counters and document uploads.
- [ ] **Task 2.2**: Build **Rental Contract Ledger**:
  - Track vendor names, daily/monthly flat rents, per-km rates, and monthly invoice generation.
- [ ] **Task 2.3**: Build **Fuel & Power Charging Log**:
  - Fuel entry modal with odometer capture, liters/units, cost, and fuel receipt image preview.
  - Automatic km/liter efficiency tracking and anomaly alerts.
- [ ] **Task 2.4**: Build **Maintenance & Repair Desk**:
  - Routine servicing vs emergency breakdown expense logs with mechanic invoices.
- [ ] **Task 2.5**: Build **Daily Route Incidental Expenses Tracker** (Tolls, puncture, parking vouchers).

---

### Phase 3: Workforce HRM, Drivers & Daily Cash Float Desk
- [ ] **Task 3.1**: Build **Employee & Labor Roster**:
  - Unified directory for Drivers, Pickers, and Yard Sorters.
  - KYC verification module (Aadhaar, Driving License, Police check review & approval).
  - Compensation tier setup (Fixed wage vs per-kg incentive).
- [ ] **Task 3.2**: Build **Morning Cash Float Issuance Console**:
  - One-click morning cash float assignment to field pickers with digital signature capture.
- [ ] **Task 3.3**: Build **Evening Shift Cash Settlement & Audit Desk**:
  - Auto-fetch verified cash pickup totals for the picker.
  - Calculate: $\text{Opening Float} - \text{Total Cash Paid} - \text{Fuel/Toll Expenses} = \text{Expected Return}$.
  - Record physical cash received and flag shortages with audit comments.
- [ ] **Task 3.4**: Build **Daily Attendance & Performance Leaderboard** (Kg collected, pickups completed, on-time arrival rate).

---

### Phase 4: Multi-Channel Inward Scrap Receiving Desk
- [ ] **Task 4.1**: Build **Unified Inward Intake Ledger**:
  - Tabbed overview: All Inward, Field Pickups (`AKP-XXXX`), Yard Walk-ins, B2B Commercial.
  - Real-time gross kg, wastage kg, net kg, and total paid out tallies.
- [ ] **Task 4.2**: Build **Yard Gate Walk-in Point-of-Sale (POS) Desk**:
  - Rapid walk-in intake entry interface optimized for touchscreen/numpad.
  - Category and product selection with auto-applied active rates.
  - Instant weighing input with deduction/wastage reasoning.
  - Thermal 3-inch receipt voucher printing and Cash/UPI payout trigger.
- [ ] **Task 4.3**: Build **B2B Bulk Cleanout & Weighbridge Entry Desk**:
  - Truck gross and tare weighbridge recording with GST e-Way bill attachments.
- [ ] **Task 4.4**: Build **Daily Inward Reconciler**:
  - Verification of physical scrap brought into the yard vs sum of picker app vouchers.

---

### Phase 5: Holiday Calendar, Route Planning & Scheduling
- [ ] **Task 5.1**: Build **Interactive Operations Holiday Calendar**:
  - Monthly / Year calendar grid supporting national, regional, and municipal holidays.
  - Holiday creator with scope selection (`ALL` vs specific vehicles/divisions).
  - Shift rule selection: `NEXT_WORKING_DAY` vs `NEXT_WEEK_SAME_DAY`.
- [ ] **Task 5.2**: Build **Holiday Impact Simulation Modal**:
  - Real-time preview showing affected route runs and customer pickup count before saving.
  - Automated customer notification queue generation.
- [ ] **Task 5.3**: Build **Weekly Route Run Master Matrix**:
  - Grid mapping Vehicles $\times$ Divisions $\times$ Weekdays.
  - Drag-and-drop stop re-sequencer and vehicle load capacity progress bar.
- [ ] **Task 5.4**: Build **Bulk Order Auto-Assign & Unassigned Exception Queue**:
  - Real-time alert feed for bulk pickups requiring manual assignment.

---

### Phase 6: Yard Inventory, Outward Sales & P&L Analytics (R&D Modules)
- [ ] **Task 6.1**: Build **Yard Stock Inventory Ledger**:
  - Track tonnage of Raw Unsorted, Sorting-in-Progress, and Baled Ready-for-Sale materials.
- [ ] **Task 6.2**: Build **Outward Mill & Smelter Dispatch Desk**:
  - Create sales orders for recyclers (Jindal, Paper Mills, Plastic Pelletizers).
  - Record outward dispatch weights, rate per kg, gate pass generation, and payment realization.
- [ ] **Task 6.3**: Build **Operations Unit Economics & P&L Dashboard**:
  - Aggregate Buying Cost + Vehicle Rents + Fuel + Labor Wages vs Outward Mill Revenue.
  - Net Gross Profit per Category and Realized Margin per Kg.
- [ ] **Task 6.4**: Build **Fraud Sentinel & Anomaly Alert Monitor**:
  - Automated flags for high-wastage pickers, weight mismatches, and float shortages.

---

## 5. Verification & Acceptance Criteria
1. **Rates Engine**: Changing margin from `-₹2.00` to `+₹1.00` immediately reflects in the simulated customer rate card and propagates via WebSocket to the live customer app.
2. **Logistics Ledger**: Entering a fuel slip or vehicle rent accrual updates the daily operational vehicle cost metric without page reload.
3. **Cash Float Reconciler**: A picker completing ₹8,200 of cash pickups from a ₹10,000 float is mathematically balanced at ₹1,800 return with zero manual math required.
4. **Gate Walk-in Intake**: A walk-in kabadiwala dropping 45 kg of iron at the yard gate receives an itemized printed voucher and cash payout in under 60 seconds.
5. **Holiday Shift**: Setting a holiday on Friday automatically moves attached weekly division pickups to Monday (or next Friday per rule) and fires `rescheduled_holiday` event logs.
