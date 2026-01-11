# Changelog

All notable changes to Ανάσα (Anasa) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.4.0] - 2026-01-11

### Added
- **Help Drawer**: Floating help button with instructions for new users
  - Persistent FAB (Floating Action Button) in bottom-right corner
  - Bottom sheet drawer with step-by-step guide in Greek
  - Pulse animation and notification dot for first-time visitors
  - Instructions cover: settings, exploring opportunities, creating plans
  - Tips for Parent Mode and Holy Spirit toggle
  - State persisted in localStorage (`anasa-help-seen`)
- **Accent-Insensitive Town Search**: Search now ignores Greek diacritics
  - "Ηρακλειο" now matches "Ηράκλειο"
- **Recurring Patron Saints**: Patron saint holidays now persist across years
  - Added to any year will appear in all years automatically
  - Movable feasts (Κινητές εορτές) calculate correct date from Easter
  - Supports: Ζωοδόχος Πηγή, Αγία Τριάδα, Παναγία Χρυσοπηγή, and more
  - One-time custom holidays remain year-specific
- **Saint George Algorithm**: Correct calculation for Άγιος Γεώργιος feast day
  - If April 23 falls on or before Easter, celebration moves to Bright Monday (Easter + 1)
  - Applies to all Saint George patron saints (12+ towns)
  - Shows "Κινητή εορτή" badge for these entries

### Fixed
- **Mobile Layout for Annual Plan**: Improved responsive design
  - Header stats use smaller padding and text on mobile
  - Clear button shows icon-only on mobile, full text on desktop
  - Action buttons arranged in 2x2 grid on mobile with shorter labels
- **Search Input Spacing**: Added proper spacing between magnifying glass icon and placeholder text
- **Movable Feast Dropdown Date**: Search dropdown now shows the calculated date for movable feasts
  - Previously showed raw date (e.g., 20/04 for Αίγιο)
  - Now calculates correct Easter-based date (e.g., 17/04 for 2026)

### Technical
- **Playwright E2E Testing**: Cross-browser E2E test suite (44 tests)
  - Covers Chromium, Firefox, and WebKit
  - Tests: optimization workflow, sorting, custom holidays, custom periods, conflict detection, annual plan, URL sharing, dark mode, accessibility, responsive design
- **GitHub Actions E2E Job**: E2E tests now run in CI pipeline
- **Expanded Test Coverage**: Unit tests increased from 618 to 688
  - Added HelpDrawer component tests
  - Expanded SettingsCard and App.vue tests
- Added `@playwright/test` package

## [1.3.0] - 2026-01-10

### Added
- **URL Sharing**: Share your complete leave plan setup via URL
  - Generates compressed shareable URLs using LZ-String compression
  - Shared links include: year, settings, custom holidays, and annual plan
  - "Κοινοποίηση" (Share) button in Annual Plan section copies URL to clipboard
  - Toast notifications for "URL copied" and "Plan loaded from URL" feedback
- **Annual Plan Image Export**: Download annual plan as PNG image
  - "Λήψη ως Εικόνα" button in Annual Plan section
  - Styled card showing year, stats, and all planned periods

### Changed
- **Year Selector Animation**: Redesigned year picker with sliding indicator animation
  - Smooth sliding effect when changing years (indicator slides from previous position)
  - Carousel-style design with gradient fades at edges
  - Responsive sizing for mobile devices
- Custom holidays list max height increased from 128px to 256px

### Fixed
- **Greek Language**: Town search and patron saints now display in Greek
  - Search dropdown shows Greek town names (e.g., "Ιεράπετρα" instead of "Ierapetra")
  - Patron saint names in Greek (e.g., "Άγιος Γεώργιος" instead of "Saint George")
  - Added holidays use Greek format: "Άγιος Γεώργιος (Ιεράπετρα)"

### Technical
- New `useShareableState` composable for URL-based state encoding/decoding
- New `AnnualPlanShareCard` component for annual plan image generation
- 98 new tests including App.vue and AnnualPlanShareCard (total: 618 tests)
- Expanded test coverage configuration to include components and utils
- Added `lz-string` package for URL compression

## [1.2.0] - 2026-01-09

### Added
- **Copy Success Alert**: Toast notification "Αντιγράφηκε!" when copying leave request text
- **Version Display**: App version shown in footer
- **Social Links**: Footer now includes links to Facebook, Instagram, LinkedIn, YouTube, and GitHub

### Changed
- **Annual Plan Always Visible**: Section now always shows, allowing users to add custom periods before selecting optimizer suggestions

### Technical
- **Shared Utilities**: Extracted duplicate code to `src/utils/` directory
  - `easterCalculation.ts`: Orthodox Easter calculation (was duplicated in useGreekHolidays and schoolHolidays)
  - `labels.ts`: Greek efficiency label generation (was duplicated in useLeaveOptimizer and useCustomPeriod)
- **Consistent Weekend Detection**: All files now use `date-fns` `isWeekend()` instead of manual checks
- 54 new tests for utils and OpportunityCard (total: 496 tests)

## [1.1.0] - 2026-01-09

### Added
- **Custom Leave Periods**: Users can now add custom leave periods to their annual plan beyond optimizer suggestions
- **Period Labels**: Optional description labels for custom periods (e.g., "Ταξίδι στην Αμερική")
- **Custom Period Badge**: Custom periods display "Προσαρμοσμένο" badge to distinguish from optimizer suggestions

### Technical
- New `CustomPeriodForm` component with date picker and label input
- New `useCustomPeriod` composable for custom period creation and validation
- `SavedOpportunity` type now includes `isCustom` and `label` optional fields
- `useAnnualPlan` composable updated to handle custom periods with labels
- `AnnualPlanSection` component displays labels and custom badges
- 61 new tests for custom period functionality (total: 442 tests)
- Updated documentation in CLAUDE.md and README.md

## [1.0.0] - 2026-01-07

### Added
- **Leave Optimization Engine**: Smart algorithm to find optimal leave periods based on efficiency ratio
- **Orthodox Easter Calculation**: Accurate calculation using Meeus/Jones/Butcher algorithm with Julian to Gregorian conversion
- **Greek Public Holidays**: Complete support for all Greek public holidays (fixed and movable)
- **Custom Holidays**: Add local holidays manually or search 130+ Greek towns for patron saint days
- **Annual Leave Plan**: Save multiple opportunities to build a yearly plan with conflict detection
- **Parent Mode**: Optimize for family time during school breaks (Christmas & Easter)
- **Holy Spirit Toggle**: Include/exclude Αγίου Πνεύματος based on company policy
- **Year Comparison**: Compare holidays across up to 3 years with weekend indicators
- **Export Options**:
  - Share as Image (PNG generation with html2canvas)
  - Calendar Export (.ics file for Google Calendar/Outlook)
  - Leave Request Generator (formal Greek leave request letters)
- **Dark Mode**: Full dark mode support with localStorage persistence
- **Sort Options**: Sort opportunities by efficiency or chronologically
- **Responsive Design**: "Modern Aegean" design system with Tailwind CSS 4

### Technical
- Vue 3 with Composition API and TypeScript
- Vite 7 build system
- Tailwind CSS 4 with custom design tokens
- date-fns with Greek locale support
- Vitest + Vue Test Utils for testing
- Complete test suite with 381 tests and 95%+ coverage

[Unreleased]: https://github.com/isarantoglou/anasa/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/isarantoglou/anasa/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/isarantoglou/anasa/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/isarantoglou/anasa/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/isarantoglou/anasa/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/isarantoglou/anasa/releases/tag/v1.0.0
