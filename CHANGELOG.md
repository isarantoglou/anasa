# Changelog

All notable changes to Ανάσα (Anasa) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- New `useShareableState` composable for URL-based state encoding/decoding
- New `AnnualPlanShareCard` component for annual plan image generation
- 24 new tests for URL sharing functionality (total: 520 tests)

### Changed
- `useAnnualPlan` composable now exports `addDirectToPlan` for URL-loaded state
- Custom holidays list max height increased from 128px to 256px
- **Year Selector Animation**: Redesigned year picker with sliding indicator animation
  - Smooth sliding effect when changing years (indicator slides from previous position)
  - Carousel-style design with gradient fades at edges
  - Responsive sizing for mobile devices

### Fixed
- **Greek Language**: Town search and patron saints now display in Greek
  - Search dropdown shows Greek town names (e.g., "Ιεράπετρα" instead of "Ierapetra")
  - Patron saint names in Greek (e.g., "Άγιος Γεώργιος" instead of "Saint George")
  - Added holidays use Greek format: "Άγιος Γεώργιος (Ιεράπετρα)"

### Dependencies
- Added `lz-string` package for URL compression

## [1.2.0] - 2026-01-09

### Added
- **Copy Success Alert**: Toast notification "Αντιγράφηκε!" when copying leave request text
- **Version Display**: App version shown in footer
- **Social Links**: Footer now includes links to Facebook, Instagram, LinkedIn, YouTube, and GitHub
- 54 new tests for utils and OpportunityCard (total: 496 tests)

### Changed
- **Annual Plan Always Visible**: Section now always shows, allowing users to add custom periods before selecting optimizer suggestions

### Refactored
- **Shared Utilities**: Extracted duplicate code to `src/utils/` directory
  - `easterCalculation.ts`: Orthodox Easter calculation (was duplicated in useGreekHolidays and schoolHolidays)
  - `labels.ts`: Greek efficiency label generation (was duplicated in useLeaveOptimizer and useCustomPeriod)
- **Consistent Weekend Detection**: All files now use `date-fns` `isWeekend()` instead of manual checks

## [1.1.0] - 2026-01-09

### Added
- **Custom Leave Periods**: Users can now add custom leave periods to their annual plan beyond optimizer suggestions
- **Period Labels**: Optional description labels for custom periods (e.g., "Ταξίδι στην Αμερική")
- **Custom Period Badge**: Custom periods display "Προσαρμοσμένο" badge to distinguish from optimizer suggestions
- New `CustomPeriodForm` component with date picker and label input
- New `useCustomPeriod` composable for custom period creation and validation
- 61 new tests for custom period functionality (total: 442 tests)

### Changed
- `SavedOpportunity` type now includes `isCustom` and `label` optional fields
- `useAnnualPlan` composable updated to handle custom periods with labels
- `AnnualPlanSection` component displays labels and custom badges
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
- Complete test suite with 381 tests and 95%+ coverage

### Technical
- Vue 3 with Composition API and TypeScript
- Vite 7 build system
- Tailwind CSS 4 with custom design tokens
- date-fns with Greek locale support
- Vitest + Vue Test Utils for testing

[1.3.0]: https://github.com/isarantoglou/anasa/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/isarantoglou/anasa/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/isarantoglou/anasa/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/isarantoglou/anasa/releases/tag/v1.0.0
