# ♚ Chess Opening Trainer

A modern, interactive web application for mastering chess openings through spaced repetition and active recall. Train your repertoire, track your progress, and fix your mistakes — all in the browser.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Rolldown-646CFF?logo=vite&logoColor=white)
![chess.js](https://img.shields.io/badge/chess.js-1.4-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### 🎯 Interactive Training
- **Drag-and-drop chessboard** — play moves directly on a fully interactive board powered by `react-chessboard`
- **Instant feedback** — visual + text feedback on every move (correct, incorrect, hints)
- **Opponent auto-play** — the app automatically plays the opponent's responses so you can focus on your side
- **Configurable timer** — optional countdown per move to simulate time pressure (3–30 seconds)
- **Hints on demand** — reveal the expected move when you're stuck
- **Auto-advance** — automatically move to the next opening/line after completion

### 📚 Opening Repertoire
- **40+ opening lines** covering both White and Black repertoires
- Openings include: **London System**, **Sicilian Defense**, **Queen's Gambit** (Accepted & Declined), **Catalan**, **Slav Defense**, **King's Indian**, **Grünfeld**, **Benoni**, **Englund Gambit**, and more
- Openings stored in clean **PGN format** for easy editing and expansion
- Filter openings by **side** (White/Black) or **search** by name, description, or ECO code

### 📊 Statistics & Progress Tracking
- **Overall accuracy** ring chart with total moves and correct count
- **Per-opening accuracy** bars with color-coded performance indicators
- **Recent session history** with timestamps and accuracy percentages
- All stats persisted in `localStorage` — no account needed

### 🛠 Mistake Review
- **Automatic mistake logging** — incorrect moves and timeouts are recorded with board position (FEN)
- **Interactive mistake review** — replay your mistakes on the board and practice the correct move
- Mistakes are automatically removed from the list once you get them right

### ⚙️ Customization
- **Board themes** — Classic Green, Wood Brown, Ice Blue, Slate Gray
- **Timer toggle & duration** control
- **Auto-advance** and **hint** toggles
- **Evaluation bar** showing material balance
- **Board flip** to view from either side

---

## 🛠 Tech Stack

| Layer        | Technology                                               |
|-------------|----------------------------------------------------------|
| **Framework** | [React 18](https://react.dev/) with functional components & hooks |
| **Build Tool** | [Vite](https://vite.dev/) (Rolldown)                  |
| **Chess Logic** | [chess.js](https://github.com/jhlywa/chess.js) for move validation, PGN parsing, FEN management |
| **Chessboard** | [react-chessboard](https://github.com/Clariity/react-chessboard) for the interactive board UI |
| **Routing** | [React Router v7](https://reactrouter.com/)              |
| **Styling** | CSS Modules with a custom dark-theme design system       |
| **Typography** | [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts |
| **Persistence** | `localStorage` for stats, mistakes, settings, and repertoire |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/bouzidmedayoub/chess-trainer.git
cd chess-trainer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── EvalBar.jsx          # Material evaluation sidebar
│   ├── MoveList.jsx         # Move history panel
│   ├── TrainerControls.jsx  # Board control buttons
│   ├── Layout.jsx           # App shell with navigation
│   ├── Opening/             # Opening card components
│   └── Training/            # Training-specific components
│       ├── LineSelector.jsx
│       ├── FeedbackBanner.jsx
│       └── TimerBar.jsx
├── data/                # Opening data & data service
│   ├── db.json              # Master database (openings + lines)
│   ├── openings.json        # White repertoire openings (PGN)
│   ├── Sicilian Defense.json
│   ├── London.json
│   ├── indianOpenings.json
│   ├── queensGambit.json
│   ├── dataService.js       # Data access layer with PGN parsing
│   └── openingsData.js      # Legacy data normalization
├── pages/               # Route-level page components
│   ├── Dashboard.jsx        # Home page with opening cards
│   ├── OpeningPage.jsx      # Training view for a specific opening
│   ├── OpeningTrainer.jsx   # Standalone trainer (all openings)
│   ├── Statistics.jsx       # Stats dashboard
│   ├── Mistakes.jsx         # Mistake review & practice
│   ├── Repertoire.jsx       # Repertoire management
│   └── Settings.jsx         # App settings
├── utils/               # Shared utilities
│   ├── statsManager.js      # Stats persistence (localStorage)
│   ├── mistakes.js          # Mistake tracking
│   └── useSettings.js       # Settings hook + board themes
├── App.jsx              # Root component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles & design tokens
```

---

## 🎮 How to Use

1. **Browse openings** on the Dashboard — filter by side or search by name/ECO code
2. **Select an opening** to view its available lines
3. **Pick a line** and start training — drag pieces to play the correct moves
4. **Review feedback** — green for correct, red for incorrect, with the expected move shown
5. **Check your stats** on the Statistics page to track accuracy over time
6. **Fix mistakes** on the Mistakes page by replaying positions you got wrong
7. **Customize** the board theme, timer, and other settings to your preference

---

## 📝 Adding New Openings

Openings are stored as JSON files in `src/data/`. Each file follows this structure:

```json
{
  "openings": [
    {
      "id": "unique-id",
      "name": "Opening Name – Variation",
      "pgn": "1. e4 e5 2. Nf3 Nc6 3. Bb5"
    }
  ]
}
```

Simply add new entries with a valid PGN string and the app will automatically parse and display them.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ♟️ and ☕ — train smarter, not harder.
</p>
