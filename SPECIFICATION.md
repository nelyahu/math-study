# Kids Study App — Specification

## 1. Overview

A fun, interactive learning application for children. The app offers multiple educational games accessible from a central main menu. It runs as a local web application (HTML/CSS/JavaScript) that can be opened in any browser — no installation required. The app supports **English** and **Hebrew** with full RTL support.

### 1.1 Available Games

| Game | Icon | Description |
|------|------|-------------|
| **Math Study** | 🧮 | Multiple-choice math questions covering four core operations |
| **Flag Quiz** | 🏳️ | Identify countries by their flags from multiple-choice answers |

---

## 2. Global Features

### 2.1 Main Menu Screen

The app opens to a **main menu** where the player selects which game to play.

- Each game is represented by a large, visually distinct card with an icon, title, and short description.
- Cards are arranged in a responsive grid (2 columns on desktop, 1 column on mobile).
- The language toggle (English / Hebrew) is always visible in the top-right corner.
- The main menu is the entry point after every game session completes (via "Back to Menu" / "Play Again" actions).

### 2.2 Language Support

| Feature | Behavior |
|---------|----------|
| **Supported languages** | English (`en`), Hebrew (`he`) |
| **Toggle** | Flag buttons (🇺🇸 / 🇮🇱) fixed in the top-right corner, accessible from every screen |
| **Direction** | `ltr` for English, `rtl` for Hebrew |
| **Math / numbers** | Always rendered LTR (`direction: ltr; unicode-bidi: isolate`) regardless of language |
| **Country names** | Displayed in the currently selected language |
| **Nikud (vowel marks)** | Optional toggle (אָ button) visible only when Hebrew is active. When enabled, Hebrew country names display with full vowel pointing (ניקוד) to aid early readers. Preference is saved to `localStorage`. |
| **Persistence** | Selected language and nikud preference saved to `localStorage` and restored on reload |

### 2.3 Shared UX Patterns

All games share the following patterns:

- **Stage structure**: Each round consists of **10 questions**.
- **Progress indicator**: Shows current question number (e.g., "Question 3 / 10") with a progress bar.
- **Answer feedback**: 😊 on correct (auto-advance after ~1.5 s), 😢 on incorrect (wrong option disabled, player retries).
- **Summary screen**: Shows first-attempt score (e.g., "8 / 10"), 🎉 emoji, and navigation buttons ("Play Again" to replay same game config, "Back to Menu" to return to main menu).
- **Non-repetition**: Recently shown questions are tracked in `localStorage` to avoid repeats across sessions (capped history).

---

## 3. Game: Math Study (🧮)

### 3.1 Topics

| Topic          | Symbol | Example       |
|----------------|--------|---------------|
| Addition       | +      | 7 + 5 = ?     |
| Subtraction    | −      | 12 − 4 = ?    |
| Multiplication | ×      | 6 × 3 = ?     |
| Division       | ÷      | 18 ÷ 6 = ?    |

### 3.2 Configuration Screen

Before each stage the player sees a configuration screen where they can:

| Setting | Options | Default |
|---------|---------|---------|
| **Topics** (multi-select, at least one required) | Addition, Subtraction, Multiplication, Division | All selected |
| **Number range per topic** | 0–10, 0–20, 0–100 | 0–10 |

- Each topic has its own independent range selector.
- The "Start" button is enabled only when at least one topic is selected.
- A "Back to Menu" link/button returns to the main menu.

### 3.3 Question Screen

1. A single math question is displayed prominently (large, kid-friendly font).
2. Four answer buttons are shown below the question.
   - Exactly **one** answer is correct.
   - The three incorrect answers (distractors) are randomly generated and:
     - Are unique (no duplicates among the four options).
     - Are non-negative integers.
     - Are plausible (close in magnitude to the correct answer to avoid trivial elimination).
3. Options are presented in **random order** every time.
4. Math equations are **always rendered LTR** even when the UI language is Hebrew.

### 3.4 Distractor Generation Rules

1. Generate 3 unique distractors by adding random offsets (±1 to ±10) to the correct answer.
2. Ensure no distractor equals the correct answer.
3. Ensure no distractor is negative.
4. Ensure all four values (correct + 3 distractors) are distinct.
5. Shuffle the four options randomly before displaying.

### 3.5 Math Constraints

- **Division questions** must always produce a whole-number (integer) result. For example, 18 ÷ 6 = 3 is valid; 7 ÷ 2 = 3.5 is **not**.
- **Subtraction questions** must always produce a **non-negative** result (minuend ≥ subtrahend).
- Distractors must also be non-negative integers.
- All numbers in questions respect the chosen range for that topic.

---

## 4. Game: Flag Quiz (🏳️)

### 4.1 Overview

A flag image is displayed and the player must identify the correct country from four multiple-choice text options (country names).

### 4.2 Configuration Screen

Before each stage the player sees a configuration screen:

| Setting | Options | Default |
|---------|---------|---------|
| **Region** (multi-select, at least one required) | All, Europe, Asia, Americas, Africa, Oceania | All selected |

- The "Start" button is enabled only when at least one region is selected.
- A "Back to Menu" link/button returns to the main menu.

### 4.3 Flag Data

- Flags are sourced via **emoji flags** (e.g., 🇫🇷, 🇯🇵) rendered at a large display size, or via a free CDN/SVG set (e.g., `flagcdn.com` or bundled SVG files). The implementation should use a reliable, visually clear approach.
- Each flag entry contains:

| Field | Description |
|-------|-------------|
| `code` | ISO 3166-1 alpha-2 country code (e.g., `FR`) |
| `nameEn` | Country name in English (e.g., "France") |
| `nameHe` | Country name in Hebrew (e.g., "צרפת") |
| `region` | One of: `europe`, `asia`, `americas`, `africa`, `oceania` |

- The app ships with a built-in data set of **at least 50 countries** across all regions, with both English and Hebrew names.

### 4.4 Question Screen

1. A **large flag image** (emoji or SVG) is displayed prominently in the center.
2. Four answer buttons show **country names** in the currently selected language.
   - Exactly **one** is correct.
   - The three distractors are randomly selected from countries in the **same region** as the correct answer (when possible) to increase difficulty. If the region has fewer than 4 countries, fill from other regions.
3. Options are presented in **random order** every time.
4. Country name buttons use the current UI language (English or Hebrew).

### 4.5 Distractor Generation Rules

1. Prefer distractors from the **same region** as the correct country to avoid trivially easy answers.
2. If the region has fewer than 4 countries total, fill remaining distractors from neighboring or random regions.
3. Ensure all four country names are distinct.
4. Shuffle the four options randomly before displaying.

### 4.6 Non-Repetition

- A history of recently shown flags is stored in `localStorage` (keyed separately from math history).
- History is capped (e.g., last 100 flags) to avoid unbounded storage growth.
- If the pool of available flags for the selected regions is exhausted, history is cleared and generation continues.

---

## 5. Screen Flow

```
┌─────────────────────────┐
│      Main Menu           │
│                          │
│  ┌──────┐  ┌──────────┐ │
│  │ 🧮   │  │ 🏳️       │ │
│  │ Math  │  │ Flags    │ │
│  │ Study │  │ Quiz     │ │
│  └──┬───┘  └──┬───────┘ │
└─────┼─────────┼─────────┘
      │         │
      ▼         ▼
┌──────────┐  ┌──────────────┐
│ Math     │  │ Flag         │
│ Config   │  │ Config       │
│ (topics, │  │ (regions)    │
│  ranges) │  │              │
│ [Start]  │  │ [Start]      │
└────┬─────┘  └──────┬───────┘
     │               │
     ▼               ▼
┌──────────┐  ┌──────────────┐
│ Math     │  │ Flag         │
│ Question │  │ Question     │  ◄── repeat 10 times each
│ 12+7 = ? │  │ 🇫🇷           │
│ [15][19] │  │ [France]     │
│ [20][18] │  │ [Germany]    │
│          │  │ [Spain]      │
│ 😊 / 😢  │  │ [Italy]      │
└────┬─────┘  │ 😊 / 😢      │
     │        └──────┬───────┘
     ▼               ▼
┌──────────┐  ┌──────────────┐
│ Summary  │  │ Summary      │
│ 8/10 🎉  │  │ 8/10 🎉      │
│[Again]   │  │[Again]       │
│[Menu]    │  │[Menu]        │
└──────────┘  └──────────────┘
```

---

## 6. Non-Functional Requirements

### 6.1 Technology Stack

| Layer | Choice |
|-------|--------|
| Language | HTML5 + CSS3 + vanilla JavaScript (no frameworks) |
| Deployment | Small folder opened locally in a browser |
| Persistence | `localStorage` for question history and language preference |
| Flag images | Emoji flags at large font size, or SVG flags from a CDN / bundled |

### 6.2 Accessibility & UX

- Large, high-contrast buttons suitable for young children.
- Bright, cheerful color palette.
- Responsive layout (works on tablets & desktops).
- No external network requests required — fully offline capable (if flags are bundled or emoji-based).
- Math equations always render LTR even in Hebrew mode.
- Country names display in the active language.

### 6.3 Constraints

- **Division questions** must always produce a whole-number (integer) result.
- **Subtraction questions** must always produce a **non-negative** result (minuend ≥ subtrahend).
- Distractors (math) must be non-negative integers.
- All numbers in math questions respect the chosen range for that topic.
- Flag quiz distractors should prefer same-region countries.

---

## 7. File Structure

```
math_study/
├── SPECIFICATION.md       ← this file
├── index.html             ← main entry point (all screens)
├── style.css              ← styling (shared + per-game)
├── app.js                 ← main menu logic, shared utilities, math game
└── flags.js               ← flag quiz logic and country data
```

---

## 8. Translation Keys

All user-visible text is translatable. Key additions for the new structure:

| Key | English | Hebrew |
|-----|---------|--------|
| `mainTitle` | 🎓 Kids Study | 🎓 לימוד לילדים |
| `mainSubtitle` | Choose a game! | !בחרו משחק |
| `mathGame` | 🧮 Math Study | 🧮 תרגול חשבון |
| `mathGameDesc` | Practice addition, subtraction, multiplication & division | תרגול חיבור, חיסור, כפל וחילוק |
| `flagsGame` | 🏳️ Flag Quiz | 🏳️ חידון דגלים |
| `flagsGameDesc` | Guess the country by its flag | זהו את המדינה לפי הדגל |
| `backToMenu` | ← Back to Menu | → חזרה לתפריט |
| `flagsRegionAll` | 🌍 All Regions | 🌍 כל האזורים |
| `flagsRegionEurope` | 🇪🇺 Europe | 🇪🇺 אירופה |
| `flagsRegionAsia` | 🌏 Asia | 🌏 אסיה |
| `flagsRegionAmericas` | 🌎 Americas | 🌎 אמריקה |
| `flagsRegionAfrica` | 🌍 Africa | 🌍 אפריקה |
| `flagsRegionOceania` | 🏝️ Oceania | 🏝️ אוקיאניה |
| `flagsConfigError` | Please select at least one region. | יש לבחור לפחות אזור אחד. |

---

## 9. Future Enhancements (Out of Scope for Current Version)

- Sound effects on correct/incorrect answer.
- Timed mode (countdown per question).
- Difficulty progression (auto-increase range after consecutive correct answers).
- Multi-player / leaderboard.
- Printable worksheet generation.
- Additional games (e.g., spelling, clock reading, geography capitals).
