# Changelog - AI Calendar & Habits Planner

All notable changes to the Super Productivity **AI Calendar & Habits Planner** plugin are documented in this file.

---

## [4.6.0] - 2026-08-22
### Fixed (Community Review Upstream Fixes)
- **Idempotent Habit Sync:** Derived stable, slugified counter IDs (`habit-title`) for `setCounter` to prevent duplicate/junk counters on re-sync.
- **Hook Integration:** Switched to official `PluginAPI.registerHook("finishDay", ...)` method.
- **Privacy Hardening (Zero Third-Party Proxies):** Completely removed `corsproxy.io` fallback. If direct calendar fetch is blocked by CORS, users are prompted to upload their `.ics` file directly.
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
