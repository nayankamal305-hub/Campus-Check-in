# CampusCheck - Mobile Design Guidelines

## Authentication & Navigation

### Auth Flow
1. **GDPR Consent** (first launch): Location tracking explanation, Accept/Decline, privacy link
2. **Login**: Email/password + SSO (Google, Apple)
3. **Role Selection**: Student or Faculty (one-time)
4. **Onboarding**: 3-screen tutorial (geofencing, auto-attendance, notifications)

**Account Management**: Profile (avatar, name, email, role), Settings (theme, notifications, location permissions), Logout (confirmation required), Delete Account (password re-auth + double confirmation)

### Tab Navigation (Bottom, 60px + safe area)

**Student (3 tabs)**:
- Home (house) - Today's classes
- Attendance (check-circle) - History
- Profile (user) - Settings

**Faculty (3 tabs)**:
- Dashboard (grid) - Overview stats
- Live Attendance (users) - Real-time monitoring
- Reports (bar-chart) - Analytics/exports

**Tab Styling**: Frosted glass, blue/purple gradient backdrop, active state (gradient color, scale 1.0→1.1), inactive (gray, 0.6 opacity)

---

## Screen Specs

### Student Home
- **Header**: Transparent, "Home" title, bell icon (badge if unread)
- **Content**: Greeting card (name, date), location status (green/red indicator), today's classes (cards: name, time, room, distance, status badge), quick stats (attendance %, class count)
- **Interactions**: Card tap→Class Details, location button→system settings

### Student Attendance
- **Header**: "Attendance History", filter icon
- **Content**: SectionList by date, cards (name, time, status, accuracy), empty state illustration
- **Features**: Pull-to-refresh, 5 shimmer cards while loading

### Faculty Dashboard
- **Header**: Transparent, "Dashboard" title, calendar icon
- **Content**: Summary cards (horizontal scroll: total classes, avg attendance, active students), live classes list (pulsing dot, student count), charts (weekly trend line, class breakdown bar)
- **Updates**: Auto-refresh every 10s

### Faculty Live Attendance
- **Header**: "Live Attendance", refresh icon
- **Content**: Class selector dropdown, map (300px: purple 50m geofence, student markers green/gray, legend), student list (avatar, name, status, time, distance, sortable)
- **FAB**: Export button (bottom-right, 24px from edges, shadow: offset {0,2}, opacity 0.10, radius 2)

### Faculty Reports
- **Header**: "Reports", download icon
- **Content**: Filters (date range, class/student multi-select), "Generate Report" button, results (stats cards, scrollable table, charts), export buttons (PDF, CSV, Excel)

### Class Details (Modal)
- **Header**: Close (X), class name, edit icon (faculty only)
- **Content**: Map (400px, geofence), info cards (room, schedule, instructor/student count), attendance records
- **Presentation**: Full-screen modal, slides up

### Profile
- **Header**: Transparent, "Profile", settings gear
- **Content**: Avatar (120px, tap to change), name (editable), email (read-only), role badge, stats (attendance/classes or managed classes/students), preferences (dark mode, notifications, location), logout button (outlined red)

---

## Design System

### Colors

**Primary Gradient** (135deg): #667eea → #764ba2

**Semantic**: Success/Present #10b981, Warning/Pending #f59e0b, Error/Absent #ef4444, Info #3b82f6

**Dark Mode**: BG #0f172a, Surface #1e293b, Border #334155, Text #f8fafc/#cbd5e1/#64748b

**Light Mode**: BG #ffffff, Surface #f8fafc, Border #e2e8f0, Text #0f172a/#475569/#94a3b8

### Typography (System Fonts)
- H1: 32px Bold, -0.5px spacing
- H2: 24px Semibold, -0.3px
- H3: 20px Semibold, -0.2px
- Body: 16px Regular
- Caption: 14px Regular
- Tiny: 12px Medium, 0.5px (uppercase labels)

### Spacing
xs:4px, sm:8px, md:12px, lg:16px, xl:24px, 2xl:32px, 3xl:48px

### Border Radius
sm:8px (inputs), md:12px (cards), lg:16px (modals), full:9999px (pills/buttons)

### Icons (Feather, 24px default)
Nav: home, grid, users, bar-chart, user | Actions: check-circle, x-circle, clock, bell, filter, download, refresh | Location: map-pin, navigation | Auth: log-in, log-out, settings

### Shadows
**Card (Light)**: color #000, offset {0,1}, opacity 0.05, radius 3, elevation 2
**FAB**: color #667eea, offset {0,2}, opacity 0.10, radius 2, elevation 4

---

## Interactions & Animations

### Touchable Feedback
- Buttons: Scale 0.95, opacity 0.8, 100ms
- Cards: Background opacity 0.9, 150ms
- List Items: 10% primary highlight
- Tabs: Scale icon 1.1, spring

### Animations
- Transitions: Slide right (stack), slide bottom (modal), 300ms ease-out
- Loading: Skeleton shimmer 1.5s loop, pulse 2s loop
- Success: Checkmark scale 0→1.2→1.0, spring 400ms
- List Items: Fade + slide bottom, stagger 50ms

### Real-time Updates
- New Attendance: Slide top, bounce
- Status Change: Color transition 300ms, scale pulse 1.0→1.05→1.0
- Live Count: Count-up 500ms

---

## Accessibility

- **Touch Target**: Min 44x44px
- **Contrast**: WCAG AA (4.5:1 text, 3:1 UI)
- **Screen Readers**: Labels on all icons/images
- **Dynamic Type**: Support system font scaling
- **Focus**: 2px blue outline (keyboard nav)
- **Haptics**: Light impact (press), notification (success/error)
- **Status Badges**: Color + text/icon (not color-only)

---

## Critical Assets

1. **App Logo**: Circular, geofence pin, gradient (512x512px)
2. **Empty States**: Line art, blue/purple accents
   - No records (student/calendar)
   - No classes (celebration)
   - Location disabled (map/prompt)
3. **Map Markers**: User icon circle, 32x32px PNG
4. **Default Avatars**: 6 education icons (grad cap, book, pencil, calculator, flask, globe) on gradient backgrounds (purple, blue, teal, green, orange, pink)

---

## Platform-Specific

### iOS
- SF Symbols (fallback Feather), swipe-back enabled, Haptics API, light status bar

### Android
- Material ripple, FAB 56x56dp (16dp margin), transparent status bar, hardware back button

---

## Performance

- **60fps**: Native driver animations
- **Lists**: FlatList `windowSize={10}`, `maxToRenderPerBatch={5}`
- **Images**: Compress markers, lazy load avatars
- **Offline-First**: Show cache immediately, background sync with indicator