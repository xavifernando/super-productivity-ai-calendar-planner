# Super Productivity AI Calendar & Habits Planner Plugin

A daily task, habits, and calendar planner for Super Productivity with Today/Tomorrow scheduling, Habits & Rituals management, and an interactive Project Backlog Explorer.

![Super Productivity AI Calendar & Habits Planner](icon.svg)

---

## 🚀 Key Features

- **AI-assisted Scheduling:** Uses calendar commitments and existing backlog tasks to draft a schedule. Unfilled time remains open; the planner does not invent tasks or repeat backlog tasks to fill every slot.
- **Collapsible Projects Explorer:** Organize project backlogs with collapsible accordions, per-project *Toggle All* switches, and one-click **`➕ Add to Today`** buttons.
- **Habits & Rituals System:** Customizable habit categories with category *Toggle All* switches and idempotent 1-click sync to Super Productivity's native habit tracker (`#/habits`).
- **Plan for Today & Tomorrow:** Toggle between planning today and preparing a draft for tomorrow.
- **Optional `finishDay` Auto-Drafting:** Off by default. When enabled in AI Providers, the `finishDay` hook reads configured calendars and task/project titles and estimates, then sends planning context to the selected AI provider.
- **Multi-LLM AI Engine with Fallback:** Built-in zero-dependency support for **Google Gemini**, **OpenAI (GPT-4o)**, **Anthropic Claude**, **Ollama (Local LLMs)**, **OpenRouter**, **Groq**, and **Custom Endpoints**.
- **Non-destructive schedule maintenance:** **`↩️ Undo Apply`** restores previous scheduling fields or unschedules newly created tasks; **`🗓️ Unschedule Date`** clears scheduling fields for incomplete tasks on the selected date while preserving tasks, projects, and subtasks.
- **6 Modern Themes:** Choose between *Catppuccin Mocha*, *Monochrome Minimal (B&W)*, *Midnight OLED*, *Nord Arctic*, *Cyberpunk Neon*, and *Minimal Studio*.
- **Task Sync:** Scheduling updates existing tasks in place and creates tasks only for genuinely new plan items. Task data syncs through Super Productivity; plugin settings, plans, habits, and API keys remain local to the app installation.

---

## 📦 Download & Installation

1. Download [`ai-calendar-planner.zip`](./ai-calendar-planner.zip).
2. In **Super Productivity**, open **Settings (⚙️) ➔ Plugins**.
3. Click **Install Plugin** and select the downloaded `ai-calendar-planner.zip`.
4. Open **AI Calendar & Habits Planner** from your Super Productivity sidebar.

---

## 🛠️ Quick Start

1. **Calendar Feeds:** In **Settings ➔ Calendar Feeds**, paste your iCal URL (e.g. `https://calendar.google.com/.../basic.ics`) or upload a `.ics` file.
2. **AI Provider (Optional):** In **Settings ➔ AI Providers**, choose your provider and add an API key. Without a key, the planner drafts from your existing tasks. API keys and plugin settings are stored in the app's localStorage, which is not isolated from other installed iframe plugins; install only plugins you trust.
3. **Habits & Rituals:** In **⚡ Habits & Rituals**, select active habits and click **`💾 Sync to Habits Section`**.
4. **Project Explorer:** In **📁 Projects Explorer**, click **`➕ Add to Today`** on any project task or create custom tasks.
5. **Dry Run & Apply:** Click **`🔍 Dry Run (Schedule Draft)`** to review a proposed schedule, adjust it, and click **`🚀 Apply Tasks`**. Open time may remain when the backlog is smaller than the available schedule.

## Data flow and network access

- Fixed Google Gemini, OpenAI, Anthropic, OpenRouter, and Groq API requests use Super Productivity's `PluginAPI.request` host allowlist.
- Calendar feeds, user-configured custom endpoints, and Ollama use direct browser requests. These destinations are user-configured and are not constrained by the manifest host list. Calendar feed URLs may contain private access tokens; the feed host receives those requests.
- Enabling finishDay auto-drafting allows the selected AI provider to receive task/project titles, estimates, calendar details, and scheduling context without a manual Dry Run.
- Plugin configuration and API keys remain in app-origin localStorage. Because iframe plugins share that origin, another installed plugin may be able to read them; the app's iframe API currently does not provide isolated secret storage.

---

## 📄 License

MIT License. Free and open source for the community.
