# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ανάσα (Anasa) - "Take a breath from work". A Vue 3 application by Oxygen (oxygen.gr) that helps users maximize their vacation days by finding optimal leave periods around Greek public holidays. The UI is fully in Greek.

## Commands

```bash
npm run dev           # Start development server (Vite)
npm run build         # Type-check with vue-tsc, then build for production
npm run preview       # Preview production build locally
npm run test          # Run tests in watch mode
npm run test:run      # Run tests once (CI mode)
npm run test:coverage # Run tests with coverage report
```

## Architecture

### Tech Stack
- Vue 3 with Composition API (`<script setup>`)
- TypeScript
- Tailwind CSS 4 (via @tailwindcss/vite plugin)
- date-fns for date manipulation (with Greek locale `el`)
- html2canvas for image generation
- Vite 7 as build tool
- Vitest + Vue Test Utils for testing

### Core Composables

**`useGreekHolidays.ts`** - Provides Greek public holidays for any year:
- Re-exports `calculateOrthodoxEaster` from `utils/easterCalculation.ts`
- Returns fixed holidays (Jan 1, Mar 25, etc.) and movable holidays (Easter-dependent: Clean Monday, Good Friday, etc.)
- Tracks which holidays fall on weekends

**`useLeaveOptimizer.ts`** - Leave optimization engine:
- Sliding window algorithm to find optimal leave periods
- Calculates efficiency ratio (totalDays / leaveDaysUsed)
- Supports "Calculate from Today" vs "Full Year" mode
- Returns non-overlapping results sorted by efficiency
- All date formatting and labels use Greek locale (`el`)

**`useYearComparison.ts`** - Year comparison utilities:
- `getEasterForYear(year)` - Easter date formatted in Greek
- `getCleanMondayForYear(year)`, `getGoodFridayForYear(year)`, etc. - Movable holidays with weekend detection
- `getFixedHolidayDay(holiday, year)` - Fixed holiday day-of-week with weekend detection
- Reuses `calculateOrthodoxEaster` from useGreekHolidays

**`usePersistedState.ts`** - Generic localStorage persistence:
- `usePersistedBoolean(key, default)` - Boolean settings
- `usePersistedNumber(key, default)` - Number settings
- `usePersistedJson<T>(key, default)` - JSON objects/arrays with deep watching
- All keys prefixed with `anasa-`
- Loads on mount, persists on change

**`useCustomPeriod.ts`** - Custom leave period creation:
- `generateCustomCalendar(start, end, holidays)` - Generates DayInfo array for date range
- `createCustomPeriod(start, end, holidays)` - Creates OptimizationResult for custom dates
- `validateDateRange(start, end, year)` - Validates dates (future only, within year, start ≤ end)
- Re-exports `getEfficiencyLabel` from `utils/labels.ts`
- `useCustomPeriod(holidays)` - Composable wrapper with reactive holidays

**`useShareableState.ts`** - URL-based state sharing:
- `encodeState(state)` - Compresses AppState to URL-safe string using LZ-String
- `decodeState(encoded)` - Decompresses string back to AppState
- `generateShareUrl(state)` - Creates full shareable URL with encoded state
- `loadStateFromUrl()` - Loads state from URL `?s=` parameter
- `hasSharedState()` - Checks if URL contains shared state
- `clearUrlState()` - Removes state from URL without page reload
- `recalculateOpportunity(opp, holidays)` - Recalculates opportunity properties with holidays
- `recalculateAppState(state, holidays)` - Recalculates all opportunities in state
- Uses minimal state format with short keys for compression efficiency
- State includes: year, settings, custom holidays, and annual plan (without days array)

### Shared Utilities (src/utils/)

**`easterCalculation.ts`** - Orthodox Easter calculation:
- `calculateOrthodoxEaster(year)` - Meeus/Jones/Butcher algorithm for Orthodox Easter (Julian → Gregorian conversion)
- `getJulianGregorianOffset(year)` - Calendar offset calculation (13 days for 1900-2099)
- Used by `useGreekHolidays`, `schoolHolidays`, and `useYearComparison`

**`labels.ts`** - Greek label generation:
- `getEfficiencyLabel(leaveDays, totalDays)` - Generates Greek efficiency labels (e.g., "Κάντε 3 ημέρες 9")
- Used by `useLeaveOptimizer` and `useCustomPeriod`

### Component Architecture

**App.vue** (~500 lines) - Main application shell, orchestrates child components

**Settings & Configuration:**
- `SettingsCard.vue` - Year carousel with sliding indicator animation, toggles (Holy Spirit, Parent Mode), leave day inputs, year stats
- `CustomHolidaysCard.vue` - Town search for patron saints, manual holiday form, holiday list
- `PublicHolidaysCard.vue` - Public holidays list with weekend warnings

**Plan Management:**
- `AnnualPlanSection.vue` - Annual plan display, stats, export buttons, custom period form
- `CustomPeriodForm.vue` - Collapsible form to add custom leave periods with date picker and label
- `HolidayTable.vue` - Full calendar table with all holidays

**Modals:**
- `modals/ConflictWarningModal.vue` - Overlap warning with force-add option
- `modals/LeaveRequestModal.vue` - Greek leave request letter generator
- `modals/YearComparisonModal.vue` - Compare holidays across 3 years
- `modals/ShareCard.vue` - Hidden card for opportunity image generation (uses inline hex colors for html2canvas)
- `modals/AnnualPlanShareCard.vue` - Hidden card for annual plan image generation

### Data Layer

**`patronSaints.ts`** - Database of 130+ Greek towns and their patron saints with feast dates. Users can search by town to add local holidays.

**`schoolHolidays.ts`** - Greek school calendar for Parent Mode:
- `getSchoolBreaks(year)` - Returns Christmas (Dec 24 - Jan 7) and Easter breaks
- `getSchoolHolidays(year)` - Returns school-specific holidays (Three Hierarchs, etc.)
- `calculateSchoolOverlap()` - Calculates overlap between leave periods and school breaks
- Easter break is dynamically calculated based on Orthodox Easter date

### Design System

**`style.css`** - "Modern Aegean" design system with:
- CSS custom properties for theming (light/dark mode)
- Color palette: Aegean blues, terracotta accents, marble neutrals
- Fonts: Cormorant Garamond (title only), Inter (body/numbers)
- Dark mode via `.dark` class on `<html>`
- Year carousel: `.year-indicator` (sliding selection), `.year-carousel-fade-left/right` (gradient fades)
- Use the frontend-design plugin for the design

**Important**: Tailwind CSS 4 uses `oklch` color functions which html2canvas doesn't support. The share card uses inline hex colors to work around this.

**Year Carousel Animation**: The year selector uses a sliding indicator that animates when changing years. The indicator is positioned at center (`left: 50%`) and uses JavaScript-driven transforms to create a sliding effect - when a year is clicked, the indicator starts offset in the opposite direction and animates to center using CSS transitions.

### Key Types (src/types.ts)

- `Holiday` - Date, name, Greek name, isMovable, isCustom
- `DayInfo` - Calendar day with cost (0=free, 1=workday)
- `OptimizationResult` - Leave period with efficiency metrics
- `SavedOpportunity` - A saved period in the annual plan (includes `isCustom` flag and optional `label` for custom periods)
- `CustomHoliday` - User-added custom holiday

## App Features

### Core Features
- **Leave Optimization**: Finds ALL leave periods for the year based on efficiency (days off / leave days used)
- **Sort Toggle**: Sort opportunities by efficiency (best value) or by date (chronological)
- **Two Leave Day Inputs**: Total annual leave days (saved) and search days (for finding opportunities)
- **Custom Holidays**: Add local holidays manually or search for patron saint days by town
- **Holy Spirit Toggle**: Some companies don't give Αγίου Πνεύματος as holiday - toggle to include/exclude
- **Dark Mode**: Toggle with persistence

### Annual Plan Features
- **Annual Leave Plan**: Save multiple opportunities to build a yearly plan
- **Custom Periods**: Add custom leave periods with date picker and optional description label (e.g., "Ταξίδι στην Αμερική")
- **Custom Period Badge**: Custom periods display "Προσαρμοσμένο" badge to distinguish from optimizer suggestions
- **Conflict Detection**: Warns when adding overlapping periods (modal with force-add option)
- **Remaining Days Tracking**: Shows used/remaining days from total allocation
- **Warning**: Alerts when searching for more days than remaining

### Export & Sharing Features
- **URL Sharing**: Share complete plan setup via compressed URL (uses LZ-String)
- **Share as Image**: Generate PNG of any opportunity (uses html2canvas with hex colors)
- **Export to Calendar**: Download annual plan as .ics file for Google Calendar/Outlook
- **Leave Request Generator**: Generate formal Greek leave request letter with copy/download

### Comparison Features
- **Year Comparison**: Modal comparing all holidays across up to 3 years
  - Fixed holidays: Πρωτοχρονιά, Θεοφάνεια, Ευαγγελισμός, Πρωτομαγιά, Δεκαπενταύγουστος, Ημέρα του Όχι, Χριστούγεννα, 2η Χριστουγέννων
  - Movable holidays: Ορθόδοξο Πάσχα, Καθαρά Δευτέρα, Μεγάλη Παρασκευή, Δευτέρα του Πάσχα, Αγίου Πνεύματος (if enabled)
  - Shows day of week with color coding (green = weekday, yellow = weekend)

### Parent Mode (Λειτουργία Γονέα)
- **Toggle**: Enable in Settings to optimize for family time during school breaks
- **School Breaks**: Shows Christmas break (Dec 24 - Jan 7) and Easter break (dynamic based on Orthodox Easter)
- **Family Sort**: New sort option "Οικογένεια" prioritizes opportunities with school holiday overlap
- **School Break Badges**: Cards show overlap with school breaks (icon, break name, days with children)
- **Data Layer**: `src/data/schoolHolidays.ts` provides school calendar calculations

## State Persistence (localStorage)

All under `anasa-*` prefix:
- `anasa-dark-mode` - Boolean for dark mode preference
- `anasa-custom-holidays` - Array of custom holidays
- `anasa-total-days` - Total annual leave days allocation
- `anasa-annual-plan` - Saved annual plan with year validation
- `anasa-parent-mode` - Boolean for parent mode preference
- `anasa-holy-spirit` - Boolean for Holy Spirit holiday inclusion

## Domain Notes

- Greek Orthodox Easter uses Julian calendar dates converted to Gregorian (13-day offset for 1900-2099)
- 2026 has 251 workdays (365 - 104 weekends - 10 weekday holidays)
- Movable holidays: Clean Monday (-48 days from Easter), Good Friday (-2), Easter Monday (+1), Holy Spirit Monday (+50)
- Fixed holidays: Jan 1 (New Year), Jan 6 (Epiphany), Mar 25 (Independence), May 1 (Labor), Aug 15 (Assumption), Oct 28 (Oxi Day), Dec 25-26 (Christmas)

## Testing

Unit tests use Vitest with jsdom environment. **618 tests** with 84%+ overall coverage (95%+ for composables/data).

### Test Files

**Composables:**
- `src/composables/useAnnualPlan.test.ts` - Annual plan management, conflict detection, custom periods with labels, localStorage
- `src/composables/useGreekHolidays.test.ts` - Orthodox Easter calculation (2020-2030), fixed/movable holidays
- `src/composables/useLeaveOptimizer.test.ts` - Calendar generation, optimization algorithm, statistics
- `src/composables/useYearComparison.test.ts` - Easter/holiday calculations, weekend detection
- `src/composables/usePersistedState.test.ts` - localStorage persistence for all data types
- `src/composables/useCustomPeriod.test.ts` - Custom period creation, validation, calendar generation
- `src/composables/useShareableState.test.ts` - URL encoding/decoding, state compression, round-trip tests

**Data:**
- `src/data/schoolHolidays.test.ts` - School breaks (Christmas/Easter), overlap calculations
- `src/data/patronSaints.test.ts` - Patron saints database, search functions, data integrity

**Components:**
- `src/components/SettingsCard.test.ts` - Year picker, toggles, inputs, stats
- `src/components/CustomHolidaysCard.test.ts` - Town search, manual form, list
- `src/components/PublicHolidaysCard.test.ts` - Holiday display, badges
- `src/components/AnnualPlanSection.test.ts` - Plan items, stats, actions, custom badges and labels
- `src/components/CustomPeriodForm.test.ts` - Date inputs, validation, preview, label input, events
- `src/components/HolidayTable.test.ts` - Table structure, formatting
- `src/components/OpportunityCard.test.ts` - Card rendering, rank display, parent mode, events

**Modals:**
- `src/components/modals/ConflictWarningModal.test.ts` - Warning display, events
- `src/components/modals/LeaveRequestModal.test.ts` - Request generation, clipboard
- `src/components/modals/YearComparisonModal.test.ts` - Year selection, comparison
- `src/components/modals/ShareCard.test.ts` - Card structure, stats
- `src/components/modals/AnnualPlanShareCard.test.ts` - Annual plan image card, date formatting, custom badges

**App:**
- `src/App.test.ts` - Dark mode, sorting, modals, footer, localStorage, component integration

**Utils:**
- `src/utils/easterCalculation.test.ts` - Orthodox Easter algorithm, Julian-Gregorian offset
- `src/utils/labels.test.ts` - Greek efficiency label generation

### Configuration

- `vitest.config.ts` - Test configuration with Vue plugin and jsdom
- Coverage includes `src/composables/**`, `src/data/**`, `src/components/**`, `src/utils/**`, and `src/App.vue`
- Tests use `toBeCloseTo()` for date calculations to handle DST/timezone edge cases

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** (x.0.0): Breaking changes or major redesigns
- **MINOR** (0.x.0): New features, backwards compatible
- **PATCH** (0.0.x): Bug fixes, backwards compatible

Current version is defined in `package.json`. Update the version and `CHANGELOG.md` when releasing:

1. Update `version` in `package.json`
2. Add new section to `CHANGELOG.md` with date and changes
3. Commit with message: `chore: release vX.Y.Z`

## Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/) format for all commits:

```
<type>(<scope>): <description>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring (no feature/fix)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (deps, build, etc.)

**Examples:**
```
feat(optimizer): add family sort option for parent mode
fix(holidays): correct Holy Spirit date calculation
docs: update project structure in README
test(useAnnualPlan): add conflict detection tests
refactor(components): extract SettingsCard from App.vue
chore: update dependencies
```

Keep descriptions concise and in lowercase (except proper nouns).
