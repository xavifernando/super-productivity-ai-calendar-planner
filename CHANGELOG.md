# Changelog - AI Calendar & Habits Planner

All notable changes to the Super Productivity **AI Calendar & Habits Planner** plugin are documented in this file.

---

## [4.6.1] - 2026-11-06
### Fixed
- Escaped calendar, task, habit, project, and AI-generated text before rendering; removed dynamic user values from inline handlers.
- Used local date keys, filtered scheduled tasks by date, and stopped adding demo data or repeating tasks in simulation.
- Updated existing tasks in place, made cleanup and undo non-destructive, and preserved existing habit counts during sync.
- Preserved imported calendar dates, included unassigned backlog tasks, converted local custom tasks once, and restored edited estimates on undo.
- Removed obsolete `plannedAt` data from scheduling decisions; the current app task API uses `dueDay` and `dueWithTime`.
- Routed fixed cloud-provider requests through the app HTTP bridge and made finishDay drafting an explicit opt-in.
- Corrected privacy and scheduling documentation; rebuilt the installation archive from current source.

## [4.6.0] - 2026-08-22
### Fixed (Community Review Upstream Fixes)
- **Idempotent Habit Sync:** Derived stable, slugified counter IDs (`habit-title`) for `setCounter` to prevent duplicate/junk counters on re-sync.
- **Hook Integration:** Switched to official `PluginAPI.registerHook("finishDay", ...)` method.
- **Privacy Hardening:** Removed the third-party CORS-proxy fallback. If direct calendar fetch is blocked by CORS, users can upload their `.ics` file instead.
- **Accurate Iframe Permissions:** Aligned manifest permissions strictly with `ALLOWED_IFRAME_API_METHODS` (`getAllCounters`, `setCounter`, `deleteCounter`, etc.).
- **Accurate SuperSync Documentation:** Clarified that task entities created by the plugin sync natively across devices.

---

## [4.5.4] - 2026-08-21
### Changed
- **Fully Generic Default Habits:** Replaced all personal routine templates with standard generic productivity and health habits for public open-source distribution.

---

## [4.5.3] - 2026-08-21
### Added
- **Factory Reset Storage Tool:** Added one-click `🧹 Factory Reset Plugin Storage` in Settings ➔ Cleanup Tools to clear all local cache, keys, and past plans.
