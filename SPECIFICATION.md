# Math Study App for Kids — Specification

## 1. Overview

A fun, interactive math practice application for children. The app presents multiple-choice math questions covering four core operations. It runs as a local web application (HTML/CSS/JavaScript) that can be opened in any browser — no installation required.

---

## 2. Topics

| Topic          | Symbol | Example       |
|----------------|--------|---------------|
| Addition       | +      | 7 + 5 = ?     |
| Subtraction    | −      | 12 − 4 = ?    |
| Multiplication | ×      | 6 × 3 = ?     |
| Division       | ÷      | 18 ÷ 6 = ?    |

---

## 3. Functional Requirements

### 3.1 Stage Configuration Screen

Before each stage the player sees a configuration screen where they can:

| Setting | Options | Default |
|---------|---------|---------|
| **Topics** (multi-select, at least one required) | Addition, Subtraction, Multiplication, Division | All selected |
| **Number range per topic** | 0–10, 0–20, 0–100 | 0–10 |

- Each topic has its own independent range selector.
- The "Start" button is enabled only when at least one topic is selected.

### 3.2 Question Screen

1. A single math question is displayed prominently (large, kid-friendly font).
2. Four answer buttons are shown below the question.
   - Exactly **one** answer is correct.
   - The three incorrect answers (distractors) are randomly generated and:
     - Are unique (no duplicates among the four options).
     - Are non-negative integers.
     - Are plausible (close in magnitude to the correct answer to avoid trivial elimination).
3. Options are presented in **random order** every time.

### 3.3 Answer Feedback

| Outcome | Visual Feedback | Behavior |
|---------|----------------|----------|
| **Correct** | A large smiling emoji 😊 appears on screen | After a short delay (~1.5 s), advance to the next question automatically. |
| **Incorrect** | A large sad emoji 😢 appears on screen | The chosen wrong answer is greyed out / disabled. The player must try again from the remaining options. |

- The player **cannot skip** a question; they must answer correctly to proceed.

### 3.4 Stage Structure

- Each stage consists of exactly **10 questions**.
- Questions are drawn randomly from the selected topics (roughly even distribution when multiple topics are chosen).
- A progress indicator shows the current question number (e.g., "Question 3 / 10").

### 3.5 Stage Completion Screen

After all 10 questions are answered the player sees a summary:

- Total correct on first attempt vs. total questions (e.g., "8 / 10 on first try!").
- A large congratulatory emoji or animation (🎉).
- A "Play Again" button that returns to the configuration screen.

### 3.6 Random Generation & Non-Repetition

- Questions are generated **randomly** at runtime using a seeded/unseeded PRNG.
- A history of recently generated questions is stored in **localStorage** so that questions do not repeat even across browser restarts.
- History is capped (e.g., last 200 questions) to avoid unbounded storage growth.
- If the pool of possible questions for a given configuration is exhausted, history is cleared and generation continues.

---

## 4. Non-Functional Requirements

### 4.1 Technology Stack

| Layer | Choice |
|-------|--------|
| Language | HTML5 + CSS3 + vanilla JavaScript (no frameworks) |
| Deployment | Single `index.html` file (or a small folder) opened locally in a browser |
| Persistence | `localStorage` for question history |

### 4.2 Accessibility & UX

- Large, high-contrast buttons suitable for young children.
- Bright, cheerful color palette.
- Responsive layout (works on tablets & desktops).
- No external network requests — fully offline.

### 4.3 Constraints

- **Division questions** must always produce a whole-number (integer) result. For example, 18 ÷ 6 = 3 is valid; 7 ÷ 2 = 3.5 is **not**.
- **Subtraction questions** must always produce a **non-negative** result (minuend ≥ subtrahend).
- Distractors must also be non-negative integers.
- All numbers in questions respect the chosen range for that topic.

---

## 5. Screen Flow

```
┌─────────────────────┐
│  Configuration Screen │
│  (topic & range      │
│   selection)         │
│  [Start]             │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Question Screen     │  ◄── repeat 10 times
│  Question 1/10       │
│  12 + 7 = ?          │
│  [15] [19] [20] [18] │
│                      │
│  😊 or 😢            │
└────────┬────────────┘
         │ after 10 questions
         ▼
┌─────────────────────┐
│  Summary Screen      │
│  Score: 8/10         │
│  🎉                  │
│  [Play Again]        │
└─────────────────────┘
```

---

## 6. Distractor Generation Rules

To keep wrong answers believable:

1. Generate 3 unique distractors by adding random offsets (±1 to ±10) to the correct answer.
2. Ensure no distractor equals the correct answer.
3. Ensure no distractor is negative.
4. Ensure all four values (correct + 3 distractors) are distinct.
5. Shuffle the four options randomly before displaying.

---

## 7. File Structure (Planned)

```
math_study/
├── SPECIFICATION.md      ← this file
├── index.html            ← main entry point
├── style.css             ← styling
└── app.js                ← all application logic
```

---

## 8. Future Enhancements (Out of Scope for v1)

- Sound effects on correct/incorrect answer.
- Timed mode (countdown per question).
- Difficulty progression (auto-increase range after consecutive correct answers).
- Multi-player / leaderboard.
- Printable worksheet generation.
