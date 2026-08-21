# Changelog - AI Calendar & Habits Planner

All notable changes to the Super Productivity **AI Calendar & Habits Planner** plugin are documented in this file.

---

## [4.5.2] - 2026-08-21
### Added
- **Collapsible Projects Accordion:** Converted the Projects Explorer into a collapsible accordion with category toggle checkboxes, matching the Habits & Rituals UX.
- **Clean Task List Design:** Removed bullet points for a sleek, modern, minimal item layout.

---

## [4.5.1] - 2026-08-21
### Fixed
- **Task Scheduled Time (`plannedAt`):** Fixed scheduled task time not showing in Super Productivity's native schedule dialog by populating `plannedAt`, `dueWithTime`, and `remindAt` simultaneously.
- **Offline / Mobile Fallback:** Added graceful notifications via `showSnack` and offline schedule simulation when no API key or network connection is available.

---

## [4.5.0] - 2026-08-21
### Added
- **Monochrome Minimal Theme:** Pure black & white contrast theme for distraction-free focus.
- **Interactive Project Backlog Explorer:** Manually create projects, tasks, and click `➕ Add to Today` on any task.
- **Category Toggle All:** Habit categories now include a one-click checkbox to enable/disable entire habit groups.
- **In-App Guide:** Added full overview and workflow tutorial directly in Settings.

---

## [4.4.0] - 2026-08-21
### Added
- **`finishDay` Background Hook:** Automatically drafts tomorrow's continuous schedule when completing a workday.
- **Model Fallback Chain:** Resilience against provider rate limits by cascading across model endpoints.

### Changed
- **Hardened Permissions:** Re-added `"http"` permission and locked `allowedHosts` to strict bare hostnames.
