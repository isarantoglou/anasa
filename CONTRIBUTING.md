# Contributing to Ανάσα

Thank you for your interest in contributing to Ανάσα! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/anasa-app.git
   cd anasa-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development

### Running Locally

```bash
npm run dev
```

### Building

```bash
npm run build
```

This runs TypeScript type-checking followed by the production build.

## Code Style

- Use TypeScript for all new code
- Follow Vue 3 Composition API patterns with `<script setup>`
- Use Tailwind CSS for styling
- Keep the UI text in Greek (this is a Greek-focused application)

## Project Architecture

Before contributing, please familiarize yourself with the project structure:

- **Composables** (`src/composables/`) - Core business logic
  - `useGreekHolidays.ts` - Holiday calculations
  - `useLeaveOptimizer.ts` - Optimization algorithm
- **Data** (`src/data/`) - Static data
  - `patronSaints.ts` - Greek towns and patron saints
  - `schoolHolidays.ts` - School calendar data
- **Types** (`src/types.ts`) - TypeScript interfaces

## Submitting Changes

1. Ensure your code passes type-checking:
   ```bash
   npm run build
   ```

2. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature description"
   ```

## Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, standardized commit messages.

### Format
```
<type>(<scope>): <description>

[optional body]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring (no feature/fix)
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (deps, build, etc.)

### Examples
```bash
feat(optimizer): add efficiency sorting option
fix(holidays): correct Orthodox Easter calculation for 2025
docs: update README with new features
test(composables): add useAnnualPlan tests
chore: update dependencies
```

3. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a Pull Request against the `main` branch

## Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Ensure the build passes
- Keep PRs focused - one feature or fix per PR

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information if relevant

## Feature Requests

Feature requests are welcome! Please open an issue describing:

- The feature you'd like to see
- Why it would be useful
- Any implementation ideas you have

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for helping improve Ανάσα!
