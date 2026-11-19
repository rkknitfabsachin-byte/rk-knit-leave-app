# RK Knit Leave Portal

> Modern, touch-first mobile Progressive Web App (PWA) for factory employee leave management at **RK Knit**, powered by Google Sheets as a database via Google Apps Script.

**🌐 Live Demo:** [https://rkknitfabsachin-byte.github.io/rk-knit-leave-app/](https://rkknitfabsachin-byte.github.io/rk-knit-leave-app/)

---

## 📱 Features

- **Aaj (Today's Attendance Hub)**: Real-time count of workers on leave today, affected department tags (`Production`, `Dyeing`, `Checker`, etc.), and pending approval alerts.
- **Searchable Operator Picker**: Fast bottom sheet with live search across all 56 factory staff members, department badges, and auto-population.
- **Quick Date Presets & Overlap Protection**: 1-tap presets (`Aaj`, `Kal Se`, `+2 Din`, `+3 Din`, `1 Hafta`) with automatic calendar duration calculation and conflict detection against existing approved leaves.
- **Leave Register**: Filterable log with instant search by name, department, or location, and status breakdown (`All`, `Pending`, `Approved`, `Rejected`).
- **Tactile Admin PIN Keypad**: On-screen 0–9 numeric keypad with dot indicators and shake animation to approve/reject pending leaves directly on mobile without browser prompts.
- **Web Audio Haptics**: Procedural synthesised sound feedback on button presses and submission with a top-bar mute toggle.
- **Offline PWA**: Cache-first instant 0ms load with background sync via service worker.

---

## 🏗️ Architecture

- **Frontend**: Vanilla HTML5, CSS3 (Bespoke design system, 60fps GPU transforms), Vanilla ES6 JavaScript (Zero build step).
- **Backend**: Google Apps Script Web App (REST endpoint handling `GET` reads and `POST` actions).
- **Database**: Google Sheets (Real-time live multi-tab records).
- **Hosting**: GitHub Pages (Static edge deployment).

---

## 🚀 Local Development

Simply run any static file server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .
```

Open `http://localhost:8080` in your browser (or mobile viewport).
