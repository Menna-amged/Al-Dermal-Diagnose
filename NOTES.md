
# Date: 14-3-2026

# Al-Dermal Grad Pnroject — Dev Log

## Project Overview

A skin diagnosis mobile app built with **React Native (Expo + TypeScript)** on the frontend and **Express.js + TypeScript + PostgreSQL (Prisma)** on the backend.

---

## Project Structure

```
MergedProject/
├── Front-End/     ← React Native / Expo app
└── Back-End/      ← Express.js API server
```

> The project was merged from two separate folders (`Al-Dermal-Diagnose` + `Full-Grad-Project`). Duplicate files were removed; `Full-Grad-Project` was used as the base with unique files carried over from `Al-Dermal-Diagnose`.

---

## Backend Changes

### `src/modules/auth/auth.controller.ts`
- Added `firstName` field to the **login response** so the frontend can display the user's name without an extra API call.

### `src/modules/users/users.controller.ts`
- Added new `getMe` endpoint handler:
  - Reads the JWT from the Authorization header
  - Returns `{ id, email, firstName, role, isPremium }`
  - Returns `401` if token is invalid or user not found

### `src/modules/users/users.routes.ts`
- Registered: `GET /users/me` → protected by `authMiddleware`

### `prisma.config.ts`
- Added `datasource.url` field using `process.env.DATABASE_URL ?? ""`
- Installed `@types/node` to fix TypeScript `process` type error

### Database
- Engine: **PostgreSQL** (system service, not Docker)
- Started with: `sudo service postgresql start`
- Migrations run with: `npx prisma migrate deploy`
- Client generated with: `npx prisma generate`
- Fixed collation mismatch warnings:
  ```sql
  ALTER DATABASE postgres REFRESH COLLATION VERSION;
  ALTER DATABASE template1 REFRESH COLLATION VERSION;
  ```

---

## Frontend Changes

### `src/config/api.ts`
- Set correct WiFi LAN IP for mobile access:
  ```ts
  const Base_URL = Platform.OS === 'web'
    ? 'http://localhost:5000'
    : 'http://192.168.1.8:5000';
  ```

### `src/services/auth.service.ts`
- On login, now stores `firstName` in AsyncStorage:
  ```ts
  await AsyncStorage.setItem('firstName', data.firstName ?? '');
  ```

### `src/navigation/AppEntry.tsx`
- Wrapped entire app in `<SafeAreaProvider>` from `react-native-safe-area-context`
- Required for safe area insets to work on all screens

### `src/navigation/RootNavigator.tsx`
- On startup: validates stored token via `GET /users/me`
  - ✅ Valid → stores `firstName`, navigates to app
  - ❌ Invalid → clears `token`, `isPremium`, `firstName` → navigates to auth
- Passes `setIsLoggedIn` to both `AppNavigator` and `AuthNavigator`

### `src/navigation/AuthNavigator.tsx`
- Added **OnboardingScreen1** and **OnboardingScreen2** as the first two screens before `UserType`

### `src/navigation/AppNavigator.tsx`
- Accepts `setIsLoggedIn` prop and passes it to `ProfileScreen` via render prop

### `src/components/layout/AuthLayout.tsx`
- Replaced `StatusBar.currentHeight` (Android-only) with `useSafeAreaInsets()`
- Auth screens no longer overlap the phone notch/camera

### `src/components/auth/AuthLoginForm.tsx`
- Added `autoCapitalize="none"` and `autoCorrect={false}` to email field
- Normalizes email before sending: `.trim().toLowerCase()`
- Fixed error key from `data?.message` → `data?.error`

### `src/screens/CreateAccountScreen.tsx`
- Fixed misleading error fallback message for connection errors

---

## New Screens Created

### `OnboardingScreen1.tsx`
- Slide 1 of 3: *"AI-Powered Skin Analysis"*
- Dot 1 active (wider), dots 2–3 inactive
- Buttons: **Skip** → UserType | **Next** → Onboarding2

### `OnboardingScreen2.tsx`
- Slide 2 of 3: *"Connect with Dermatologists"*
- Dot 2 active, dots 1 & 3 inactive
- Buttons: **Skip** → UserType | **Next** → UserType

### `UserTypeScreen.tsx` (modified)
- Updated to show dot **3** as active (it's now the 3rd onboarding step)

---

## Safe Area Fix (All Screens)

**Problem:** Content was overlapping the phone camera/notch area.

**Root Cause:** `StatusBar.currentHeight` is Android-only (returns `null` on iOS), and it was being used in static `StyleSheet.create()` — not reactive.

**Fix applied to all screens:**

| Screen | Fixed |
|---|---|
| `AuthLayout.tsx` | ✅ |
| `HomeScreen.tsx` | ✅ |
| `CameraScreen.tsx` | ✅ |
| `ProfileScreen.tsx` | ✅ |
| `HistoryScreen.tsx` | ✅ |
| `DoctorScreen.tsx` | ✅ |
| `ResultScreen.tsx` | ✅ |

**Pattern used in each screen:**
```tsx
import { useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();
<View style={[styles.screen, { paddingTop: insets.top }]}>

// In StyleSheet:
screen: { flex: 1, backgroundColor: "..." }, // No paddingTop here
```

---

## Dynamic Welcome Message

- `HomeScreen.tsx` reads `firstName` from AsyncStorage on mount
- Displays: **"Welcome back, [FirstName]"**
- Updates correctly after login/logout cycles

---

## Logout Feature

### `ProfileScreen.tsx`
- Added red **Logout** button at the bottom of the scroll view
- On web: uses `window.confirm()` (Alert doesn't work on web)
- On mobile: uses `Alert.alert()` with confirmation dialog
- On confirm: clears `token`, `isPremium`, `firstName` from AsyncStorage → calls `setIsLoggedIn(false)`

---

## Session Info

- JWT expiry: **7 days**
- If the app is not opened within 7 days, the token expires and the user is logged out automatically on next launch

---

## How to Run

### Backend
```bash
cd MergedProject/Back-End
sudo service postgresql start
npm run dev
```

### Frontend (Mobile)
```bash
cd MergedProject/Front-End
npx expo start
```

### Dashboard (separate Vite app)
```bash
cd Skin-diagnose-dashboard/dashboard
npm run dev
```

### Dashboard Backend  ← (dashboard-backend — separate from the main app backend)
```bash
cd Skin-diagnose-dashboard/dashboard-backend
npm run dev
```

---

## Dashboard Backend — `Skin-diagnose-dashboard/dashboard-backend/`

> **Note:** Originally built as a standalone backend with its own `DermaAiDashboard` database. Later **connected to the main app** — now points at the same `DermaAi` database and reads real mobile app data. See the **Dashboard ↔ Mobile App Connection** section below for full details.

### What was built

A full **Express.js + TypeScript + Prisma + PostgreSQL** REST API for the admin dashboard.

#### Database (`DermaAiDashboard`)

Five models were created in `prisma/schema.prisma`:

| Model | Description |
|---|---|
| `Admin` | Dashboard admin users with roles (Administrator, Dermatologist, Skin Analyst) |
| `Doctor` | Doctors managed by the dashboard — name, email, phone, status (ACTIVE / INACTIVE / BANNED) |
| `Patient` | Patients linked to a doctor — name, email, age, gender, blood type, last visit |
| `Case` | Skin diagnosis cases — condition, risk level, status, AI confidence score, linked to a patient and doctor |
| `Report` | Medical reports — title, type (Monthly/Quarterly/Annual/Special), status (Draft/Published), linked to a doctor |

#### API Endpoints

All endpoints except `POST /auth/login` require a `Bearer` JWT token in the `Authorization` header.

| Method | Route | Description |
|---|---|---|
| POST | `/auth/login` | Login with email + password, returns JWT |
| GET | `/auth/me` | Returns current admin info from token (used for session restore on page reload) |
| GET / POST | `/doctors` | List all doctors / Create a doctor |
| PUT / DELETE | `/doctors/:id` | Update / Delete a doctor |
| POST | `/doctors/:id/toggle-ban` | Toggle ban/unban status |
| GET / POST | `/patients` | List all patients / Create a patient |
| PUT / DELETE | `/patients/:id` | Update / Delete a patient |
| GET / POST | `/cases` | List all cases / Create a case |
| PUT / DELETE | `/cases/:id` | Update / Delete a case |
| GET / POST | `/reports` | List all reports / Create a report |
| PUT / DELETE | `/reports/:id` | Update / Delete a report |
| POST | `/reports/:id/publish` | Change report status to Published |
| GET | `/statistics` | Returns computed chart data: monthly cases, condition distribution, AI accuracy per condition, patient age groups, and total KPI counts |

#### Auto-seed

On first startup, if no admin exists, the server automatically creates a default admin:
- Email: `admin@dermacam.com`
- Password: `admin`

#### Key Files

```
dashboard-backend/
├── prisma/schema.prisma          ← DB schema (5 models)
├── src/server.ts                 ← Entry point, runs seed on startup
├── src/app.ts                    ← Express app, all routes registered
├── src/config/prisma.ts          ← Prisma client instance
├── src/middlewares/auth.middleware.ts  ← JWT verification
├── src/utils/jwt.ts              ← Token generation and verification
├── src/utils/hash.ts             ← bcrypt password hashing
└── src/modules/
    ├── auth/                     ← Login + /me endpoint
    ├── doctors/                  ← Full CRUD + toggle-ban
    ├── patients/                 ← Full CRUD
    ├── cases/                    ← Full CRUD (case numbers formatted as SK-XXXX)
    ├── reports/                  ← Full CRUD + publish (report numbers formatted as RPT-XXX)
    └── statistics/               ← Aggregated chart + KPI data
```

---

## Dashboard Frontend — Connected to Backend

The dashboard frontend (`Skin-diagnose-dashboard/dashboard/`) was updated to consume the real backend instead of in-memory mock data.

### Changes Made

#### New: `src/config/api.js`
- Axios instance pointed at `http://localhost:5001`
- Request interceptor automatically attaches the JWT token from `localStorage` to every request

#### Updated: `src/services/index.js`
- Replaced all in-memory mock implementations with real `axios` API calls
- Added data normalizers to bridge backend field names to what the UI components expect:
  - Enum values: backend returns uppercase (`ACTIVE`, `BANNED`) → normalized to lowercase (`active`, `banned`)
  - `joinedAt` (ISO datetime) → `joined` (date-only string `YYYY-MM-DD`)
  - `patient: { name }` / `doctor: { name }` (nested objects) → flat `patient` / `doctor` name strings
  - `casesCount` → `cases`
  - `formattedId` (e.g. `SK-0001`, `RPT-001`) → added as `displayId` for display while the real UUID stays as `id` for API calls
  - Report/case `type` and `status` converted to title-case for display
- Added `StatisticsService.get()` which fetches `/statistics` and transforms the data into the exact format each chart component expects (computes percentages for donut chart and age distribution)
- `AuthService.login()` now stores the JWT in `localStorage`; `AuthService.logout()` removes it

#### Updated: `src/context/AuthContext.jsx`
- On mount, attempts to restore the session by calling `GET /auth/me` with the stored token
- If the token is valid, the user is restored without needing to log in again
- Login errors now show the server's error message instead of a generic fallback
- `logout()` calls `AuthService.logout()` to clear the token from `localStorage`

#### Updated: `src/pages/Statistics/StatisticsPage.jsx`
- Removed static `MockData` imports
- Fetches live data from `StatisticsService.get()` on mount
- KPI cards now show real counts (total doctors, patients, cases, reports)

#### Updated: `src/pages/Dashboard/DashboardPage.jsx`
- Removed static `MockData` imports
- Fetches recent cases from `CaseService.getAll()` and chart data from `StatisticsService.get()` on mount
- KPI cards (total, diagnosed, pending, high risk) computed from live case data

---

## Dashboard ↔ Mobile App Connection

### What changed

The dashboard was originally isolated with its own `DermaAiDashboard` database and separate Doctor/Patient tables. It is now connected to the main mobile app's `DermaAi` database — one shared database for both systems.

### Main App Schema — `Back-End/prisma/schema.prisma`

New fields added to the `User` model (all optional, no breaking changes to existing functionality):

| Field | Type | Purpose |
|---|---|---|
| `phone` | `String?` | Phone number, editable from dashboard |
| `isBanned` | `Boolean` | Ban/unban via dashboard; login blocked if true |
| `bloodType` | `String?` | Patient medical info |
| `lastVisit` | `DateTime?` | Patient's last visit date |
| `assignedDoctorId` | `String?` | FK to another User (doctor) assigned to this patient |

New models added to the main app schema and migrated into `DermaAi`:

| Model | Description |
|---|---|
| `Case` | Skin diagnosis cases — condition, risk, status, confidence, linked to patient and doctor User records |
| `Report` | Medical reports — title, type, status, linked to a doctor User record |
| `Admin` | Dashboard admin accounts (separate from mobile app users) |

Migration name: `connect_dashboard`

### Main App Login — `Back-End/src/modules/auth/auth.service.ts`

Added ban check: if `user.isBanned === true`, login returns `"Your account has been suspended"`. This means banning a doctor or patient from the dashboard immediately blocks their mobile app access.

### Dashboard Backend — What changed

**`.env`**: `DATABASE_URL` changed from `DermaAiDashboard` → `DermaAi`

**`prisma/schema.prisma`**: Now mirrors the full main app schema. The dashboard backend does **not** run `prisma migrate` — only `prisma generate`. All migrations are owned by `Back-End/`.

**All services rewritten to use the `User` table:**

| Service | Before | After |
|---|---|---|
| Doctors | Queried `Doctor` table | Queries `User` where `role = DOCTOR` |
| Patients | Queried `Patient` table | Queries `User` where `role = PATIENT` |
| Toggle-ban | Updated `DoctorStatus` enum | Updates `isBanned` on the real User record |
| Patient → Doctor assignment | Stored doctor name string | Looks up doctor by name in `User` table, stores `assignedDoctorId` FK |
| Create doctor/patient | Standalone records | Creates real `User` accounts (auto-verified, temp password) |
| Statistics KPIs | Counted Doctor/Patient tables | Counts `User` by role |
| Age distribution | Queried `Patient` table | Queries `User` where `role = PATIENT` |

### Result

- Any user who registers as a **patient** or **doctor** via the mobile app immediately appears in the dashboard
- Banning a user from the dashboard blocks them from logging into the mobile app
- Cases and reports created in the dashboard are stored in the shared database
- Both systems stay in sync automatically — no manual data transfer needed

---

## Email Uniqueness & Error Handling

### Cross-table email validation

Doctors and patients now share the same `User` table, so the database unique constraint on `email` already prevents two users having the same email. On top of that, explicit pre-checks were added in the services to return clear messages before Prisma ever gets a chance to throw a raw constraint error:

| Scenario | Error message |
|---|---|
| Add patient with an existing patient's email | "A patient with this email already exists" |
| Add patient with a doctor's email | "This email is already registered as a doctor" |
| Add doctor with an existing doctor's email | "A doctor with this email already exists" |
| Add doctor with a patient's email | "This email is already registered as a patient" |
| Edit doctor/patient email to a taken one | Same checks, same messages |

### Global error handler — `dashboard-backend/src/app.ts`

A global Express error-handling middleware was added at the bottom of `app.ts`. All controllers were updated to call `next(err)` instead of catching errors inline. The middleware catches any Prisma `P2002` (unique constraint) error that slips past the pre-checks and converts it to `"This <field> is already in use"` instead of exposing the raw Prisma stack trace. All other errors fall back to `err.message`.

The axios response interceptor in `dashboard/src/config/api.js` extracts `err.response.data.error` and re-throws it as a plain `Error`, so the correct message always reaches the toast notification.

---

## Live Doctor Dropdown in Dashboard Forms

### Problem
The Assigned Doctor dropdowns in the Patients, Cases, and Reports add/edit forms were populated from a hardcoded `DOCTORS_LIST` array in `types/index.js` with fake names left over from mock data.

### Fix
`DOCTORS_LIST` was removed from `types/index.js`. The three affected pages now fetch the real doctor list from the API on mount using `DoctorService.getAll()`:

- `PatientsPage.jsx` — Assigned Doctor dropdown
- `CasesPage.jsx` — Doctor dropdown
- `ReportsPage.jsx` — Author dropdown

Only **non-banned** doctors are shown. A placeholder `— None —` / `— Select doctor —` option is always present so the field can be left empty.
