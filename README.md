# DAUST Logistic Platform

A mobile app for tracking equipment checkouts and facility access at DAUST university. Users scan barcodes on equipment or room doors to log checkouts, returns, entries and exits. The app supports advance booking with conflict detection, in-app notifications, role-based access control, and a full admin dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript 5.9 (strict) |
| Backend | Convex (real-time database + serverless functions) |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| Scanner | expo-camera v17 (barcode/QR) |
| Notifications | expo-notifications + in-app notification system |
| Haptics | expo-haptics for scan feedback |
| Storage | AsyncStorage for session persistence |

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone. The Convex backend is already deployed.

### Test Accounts

| ID | Password | Role |
|----|----------|------|
| ADMIN-001 | admin123 | Super Admin |
| STU-001 | student123 | Student |
| FAC-001 | faculty123 | Faculty |

## Screens

### Login
Simple ID + password authentication. New IDs are auto-created on first login.

### Home
Welcome card with notification bell (unread count badge), scan button, quick-book facility chips, and recent activity feed. Tapping the bell opens a bottom-sheet with all notifications and mark-as-read controls.

### Equipment
Searchable list of all items with real-time status, weekly usage heatmap, and checkout count. Filter by All / Available / In Use. Tapping an item opens the detail screen. Tapping a "checked out by" name opens the user's profile.

### Item Detail
Full item view with status, category, location. Shows who currently has the item (tappable profile card) when in use. Checkout/return actions, plus a "Book for Later" collapsible with day/duration/time-slot picker and conflict detection.

### Bookings
Personal booking list split into Upcoming and Past. Each card shows item/facility name, time range, status badge (Confirmed, In Progress, Completed, No-Show, Cancelled). Cancel button on upcoming bookings.

### Scanner
Camera barcode scanner with corner-frame overlay. Haptic feedback on scan (success vibration for valid barcodes, error for invalid). Supports QR, Code128, and Code39 formats.

### Scan Result
Context-aware action screen after scanning. For equipment: checkout or return with duration tracking. For facilities: enter or exit with occupancy display. Haptic feedback on action outcomes.

### Book Facility
Dedicated booking flow for rooms. Date picker (7 days), duration picker (30 min to 4 hours), time grid showing live availability per slot (count/capacity), optional notes. Push notification reminders 30 min before and at booking time.

### History
Personal scan history grouped by date (Today, Yesterday, etc). Shows action type, item/facility name, timestamp, and duration for returns/exits.

### Profile
User profile with avatar (initials), role badge, admin tag if applicable. Editable fields: name, email, phone, plus role-specific fields (major/year for students, department/position for faculty/staff). Logout button.

### Admin (admin only)
Three-tab dashboard:

- **Live**: real-time stats (items out, bookings, occupants, no-shows), overdue alerts with time-since, equipment checkout list with tappable user profiles and "Remind" button (sends in-app return reminder), room occupancy bars.
- **Bookings**: upcoming bookings with user profiles, status management (mark no-show, cancel), batch no-show flagging for overdue bookings.
- **Audit**: full scan history with search and action-type filters (checkout, return, entry, exit).

## Architecture

```
App.tsx                     Root: ConvexProvider, auth state, navigation
screens/
  LoginScreen.tsx           ID + password login
  HomeScreen.tsx            Dashboard with notifications
  ItemsScreen.tsx           Equipment list with search/filter
  ItemDetailScreen.tsx      Item detail + booking
  MyBookingsScreen.tsx      Personal bookings
  ScannerScreen.tsx         Camera barcode scanner
  ScanResultScreen.tsx      Post-scan actions
  BookFacilityScreen.tsx    Facility booking flow
  HistoryScreen.tsx         Personal scan history
  ProfileScreen.tsx         User profile + edit
  AdminScreen.tsx           Admin dashboard
components/
  UserProfileModal.tsx      Reusable user profile popup
  NotificationsModal.tsx    Notification list bottom-sheet
convex/
  schema.ts                 Database schema (7 tables)
  users.ts                  Auth, profile CRUD, admin management
  items.ts                  Equipment checkout/return, stats
  facilities.ts             Facility entry/exit, occupancy
  bookings.ts               Booking CRUD, availability, no-show tracking
  notifications.ts          In-app notification system
  scans.ts                  Scan history, audit trail, dashboard stats
  seed.ts                   Test data seeder
  migrations.ts             Data backfill utilities
utils/
  notifications.ts          Push notification scheduling helpers
types.ts                    Navigation type definitions
```

## Database Schema

- **users** - Student/faculty/staff profiles with RBAC (isAdmin flag separate from role)
- **items** - Equipment with barcode, category, location, status
- **facilities** - Rooms with barcode, type, capacity
- **scans** - Audit trail of all checkout/return/entry/exit actions
- **activeCheckouts** - Currently checked-out items (deleted on return)
- **activeOccupancy** - Users currently inside facilities (deleted on exit)
- **bookings** - Advance reservations with status machine
- **notifications** - In-app notifications (return reminders, general)

## Barcode Format

- Equipment: `ITEM-SCOPE-001`, `ITEM-HDMI-001`, etc.
- Facilities: `FACILITY-LAB1`, `FACILITY-CLASS2A`, etc.

## Key Features

- Real-time data sync via Convex subscriptions
- Barcode scanning with haptic feedback
- Equipment checkout/return with duration tracking
- Facility entry/exit with live occupancy
- Advance booking with conflict detection
- Push + in-app notification reminders
- Booking state machine (pending, confirmed, in_progress, completed, no_show, cancelled)
- Weekly availability heatmap per item
- Tappable user profiles across the app
- Admin return reminders (in-app notifications)
- Role-based access control (student, faculty, staff + admin flag)
- Persistent login sessions
- Admin dashboard with overdue alerts and no-show tracking
- Full audit trail with search and action filters
