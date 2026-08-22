# Super Productivity AI Calendar & Habits Planner Plugin

A universal AI-powered daily task, habits, and calendar scheduler with continuous hour-by-hour timeblocking, Tomorrow planning, Habits & Rituals management, interactive Project Backlog Explorer, and direct Super Productivity integration.

![Super Productivity AI Calendar & Habits Planner](icon.svg)

---

## 🚀 Key Features

- **Continuous Full-Day Timeblocking:** Mathematically analyzes calendar commitments (Google Calendar, Outlook, local iCal) and populates 100% of open hours with high-impact project tasks and deep work sessions with zero dead gaps.
- **Collapsible Projects Explorer:** Organize project backlogs with collapsible accordions, per-project *Toggle All* switches, and one-click **`➕ Add to Today`** buttons.
- **Habits & Rituals System:** Customizable habit categories with category *Toggle All* switches and idempotent 1-click sync to Super Productivity's native habit tracker (`#/habits`).
- **Plan for Today & Tomorrow:** Toggle seamlessly between planning Today and staging tomorrow's continuous schedule in advance before evening shutdown.
- **Background `finishDay` Auto-Drafting:** Uses `registerHook("finishDay")` to automatically generate a draft schedule for tomorrow whenever you conclude your workday.
- **Multi-LLM AI Engine with Fallback:** Built-in zero-dependency support for **Google Gemini**, **OpenAI (GPT-4o)**, **Anthropic Claude**, **Ollama (Local LLMs)**, **OpenRouter**, **Groq**, and **Custom Endpoints**.
- **Undo & Deep Cleanup:** Features **`↩️ Undo Apply`** to revert accidental schedule applications and **`🧹 Clear Today & Inbox`** to purge uncompleted tasks.
- **6 Modern Themes:** Choose between *Catppuccin Mocha*, *Monochrome Minimal (B&W)*, *Midnight OLED*, *Nord Arctic*, *Cyberpunk Neon*, and *Minimal Studio*.
- **Direct Task Sync:** Tasks scheduled by the planner populate standard Super Productivity models with `plannedAt`, `dueWithTime`, and `timeEstimate`, syncing natively with your core app.
- **100% Privacy-First:** No third-party CORS proxies; secret calendar URLs and API keys stay on your local device.

---

## 📦 Download & Installation

1. Download [`ai-calendar-planner.zip`](./ai-calendar-planner.zip).
2. In **Super Productivity**, open **Settings (⚙️) ➔ Plugins**.
3. Click **Install Plugin** and select the downloaded `ai-calendar-planner.zip`.
4. Open **AI Calendar & Habits Planner** from your Super Productivity sidebar.

---

## 🛠️ Quick Start

1. **Calendar Feeds:** In **Settings ➔ Calendar Feeds**, paste your iCal URL (e.g. `https://calendar.google.com/.../basic.ics`) or upload a `.ics` file.
2. **AI Provider (Optional):** In **Settings ➔ AI Providers**, choose your preferred model and paste your API key (stored safely in local storage only). If no API key is provided, the built-in continuous schedule simulation engine handles scheduling automatically!
3. **Habits & Rituals:** In **⚡ Habits & Rituals**, select active habits and click **`💾 Sync to Habits Section`**.
4. **Project Explorer:** In **📁 Projects Explorer**, click **`➕ Add to Today`** on any project task or create custom tasks.
5. **Dry Run & Apply:** Click **`🔍 Dry Run (Full Day Plan)`** to review your timeblocked day, adjust start/end times if desired, and click **`🚀 Apply Tasks`**!

---

## 📄 License

MIT License. Free and open source for the community.
