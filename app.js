/* ============================================================
   Math Study App — Application Logic
   ============================================================ */

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────
    const QUESTIONS_PER_STAGE = 10;
    const HISTORY_CAP = 200;
    const HISTORY_KEY = 'mathStudy_questionHistory';
    const LANG_KEY = 'mathStudy_lang';
    const FEEDBACK_DELAY_MS = 1500;

    // ─── Translations ────────────────────────────────────────
    const translations = {
        en: {
            title: '🧮 Math Study',
            subtitle: "Pick your topics and let's practice!",
            addition: '➕ Addition',
            subtraction: '➖ Subtraction',
            multiplication: '✖️ Multiplication',
            division: '➗ Division',
            start: 'Start! 🚀',
            configError: 'Please select at least one topic.',
            progress: 'Question {n} / {total}',
            stageComplete: '🎉 Stage Complete!',
            summaryScore: '{score} / {total} on first try!',
            playAgain: 'Play Again 🔄',
        },
        he: {
            title: '🧮 תרגול חשבון',
            subtitle: 'בחרו נושאים ובואו נתרגל!',
            addition: '➕ חיבור',
            subtraction: '➖ חיסור',
            multiplication: '✖️ כפל',
            division: '➗ חילוק',
            start: '🚀 !התחילו',
            configError: 'יש לבחור לפחות נושא אחד.',
            progress: 'שאלה {n} מתוך {total}',
            stageComplete: '🎉 !השלב הושלם',
            summaryScore: '{score} מתוך {total} בניסיון הראשון!',
            playAgain: '🔄 שחקו שוב',
        },
    };

    let currentLang = localStorage.getItem(LANG_KEY) || 'en';

    // ─── DOM References ──────────────────────────────────────
    const screens = {
        config:   document.getElementById('config-screen'),
        question: document.getElementById('question-screen'),
        summary:  document.getElementById('summary-screen'),
    };

    const configUI = {
        checkboxes: {
            addition:       document.getElementById('chk-addition'),
            subtraction:    document.getElementById('chk-subtraction'),
            multiplication: document.getElementById('chk-multiplication'),
            division:       document.getElementById('chk-division'),
        },
        ranges: {
            addition:       document.getElementById('range-addition'),
            subtraction:    document.getElementById('range-subtraction'),
            multiplication: document.getElementById('range-multiplication'),
            division:       document.getElementById('range-division'),
        },
        btnStart:   document.getElementById('btn-start'),
        errorMsg:   document.getElementById('config-error'),
    };

    const questionUI = {
        progressBar:  document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        questionText: document.getElementById('question-text'),
        feedbackEmoji: document.getElementById('feedback-emoji'),
        optionsContainer: document.getElementById('options-container'),
    };

    const summaryUI = {
        score:       document.getElementById('summary-score'),
        btnPlayAgain: document.getElementById('btn-play-again'),
    };

    const langUI = {
        btnEn: document.getElementById('btn-lang-en'),
        btnHe: document.getElementById('btn-lang-he'),
    };

    // ─── i18n Helpers ────────────────────────────────────────
    function t(key, replacements) {
        let text = translations[currentLang][key] || translations.en[key] || key;
        if (replacements) {
            for (const [k, v] of Object.entries(replacements)) {
                text = text.replace(`{${k}}`, v);
            }
        }
        return text;
    }

    function applyLanguage() {
        // Set direction
        if (currentLang === 'he') {
            document.body.classList.add('rtl');
            document.documentElement.lang = 'he';
        } else {
            document.body.classList.remove('rtl');
            document.documentElement.lang = 'en';
        }

        // Toggle active class on flag buttons
        langUI.btnEn.classList.toggle('active', currentLang === 'en');
        langUI.btnHe.classList.toggle('active', currentLang === 'he');

        // Translate all static elements with data-i18n
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            // Skip dynamic keys that need parameters
            if (key === 'progress' || key === 'summaryScore') return;
            el.textContent = t(key);
        });

        // Update dynamic text if currently on question screen
        if (screens.question.classList.contains('active') && questions.length > 0) {
            const num = currentIndex + 1;
            questionUI.progressText.textContent = t('progress', { n: num, total: QUESTIONS_PER_STAGE });
        }

        // Update summary score if currently on summary screen
        if (screens.summary.classList.contains('active')) {
            summaryUI.score.textContent = t('summaryScore', { score: firstAttemptCorrect, total: QUESTIONS_PER_STAGE });
        }

        // Persist preference
        localStorage.setItem(LANG_KEY, currentLang);
    }

    function switchLanguage(lang) {
        currentLang = lang;
        applyLanguage();
    }

    // ─── State ───────────────────────────────────────────────
    let questions = [];          // array of 10 question objects for current stage
    let currentIndex = 0;        // which question we're on (0-based)
    let firstAttemptCorrect = 0; // count of questions answered correctly on first try
    let isFirstAttempt = true;   // whether current question is still on first attempt

    // ─── History (localStorage) ──────────────────────────────
    function loadHistory() {
        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveHistory(history) {
        // Keep only the last HISTORY_CAP entries
        if (history.length > HISTORY_CAP) {
            history = history.slice(history.length - HISTORY_CAP);
        }
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function questionKey(q) {
        return `${q.topic}|${q.a}|${q.op}|${q.b}`;
    }

    // ─── Random Helpers ──────────────────────────────────────
    function randInt(min, max) {
        // inclusive of both min and max
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // ─── Question Generation ─────────────────────────────────
    function generateQuestion(topic, maxNum, historySet) {
        const MAX_TRIES = 500;
        for (let t = 0; t < MAX_TRIES; t++) {
            let a, b, answer, op, display;

            switch (topic) {
                case 'addition':
                    a = randInt(0, maxNum);
                    b = randInt(0, maxNum);
                    answer = a + b;
                    op = '+';
                    display = `${a} + ${b} = ?`;
                    break;

                case 'subtraction':
                    a = randInt(0, maxNum);
                    b = randInt(0, maxNum);
                    if (a < b) [a, b] = [b, a]; // ensure non-negative result
                    answer = a - b;
                    op = '−';
                    display = `${a} − ${b} = ?`;
                    break;

                case 'multiplication':
                    a = randInt(0, maxNum);
                    b = randInt(0, maxNum);
                    answer = a * b;
                    op = '×';
                    display = `${a} × ${b} = ?`;
                    break;

                case 'division':
                    // Generate b (divisor) first, then answer, then compute a = b * answer
                    b = randInt(1, maxNum); // divisor at least 1
                    answer = randInt(0, maxNum);
                    a = b * answer;
                    op = '÷';
                    display = `${a} ÷ ${b} = ?`;
                    break;

                default:
                    continue;
            }

            const key = `${topic}|${a}|${op}|${b}`;
            if (historySet.has(key)) continue; // already used recently

            return { topic, a, b, op, answer, display, key };
        }
        // If exhausted, return without history guard (pool too small)
        return generateQuestionNoHistory(topic, maxNum);
    }

    function generateQuestionNoHistory(topic, maxNum) {
        let a, b, answer, op, display;
        switch (topic) {
            case 'addition':
                a = randInt(0, maxNum); b = randInt(0, maxNum);
                answer = a + b; op = '+'; display = `${a} + ${b} = ?`; break;
            case 'subtraction':
                a = randInt(0, maxNum); b = randInt(0, maxNum);
                if (a < b) [a, b] = [b, a];
                answer = a - b; op = '−'; display = `${a} − ${b} = ?`; break;
            case 'multiplication':
                a = randInt(0, maxNum); b = randInt(0, maxNum);
                answer = a * b; op = '×'; display = `${a} × ${b} = ?`; break;
            case 'division':
                b = randInt(1, maxNum); answer = randInt(0, maxNum);
                a = b * answer; op = '÷'; display = `${a} ÷ ${b} = ?`; break;
        }
        const key = `${topic}|${a}|${op}|${b}`;
        return { topic, a, b, op, answer, display, key };
    }

    function generateDistractors(correctAnswer) {
        const distractors = new Set();
        let range = Math.max(10, Math.ceil(correctAnswer * 0.5));
        let attempts = 0;

        while (distractors.size < 3 && attempts < 100) {
            attempts++;
            let offset = randInt(1, range);
            if (Math.random() < 0.5) offset = -offset;
            const val = correctAnswer + offset;
            if (val >= 0 && val !== correctAnswer && !distractors.has(val)) {
                distractors.add(val);
            }
        }

        // Fallback: fill remaining slots with sequential values
        let fallback = 1;
        while (distractors.size < 3) {
            const val = correctAnswer + fallback;
            if (val >= 0 && !distractors.has(val) && val !== correctAnswer) {
                distractors.add(val);
            }
            fallback++;
        }

        return [...distractors];
    }

    function buildStageQuestions(selectedTopics) {
        // selectedTopics: [{topic: 'addition', maxNum: 10}, ...]
        const history = loadHistory();
        const historySet = new Set(history);

        const generatedQuestions = [];
        const newKeys = [];

        for (let i = 0; i < QUESTIONS_PER_STAGE; i++) {
            // Distribute topics roughly evenly
            const topicInfo = selectedTopics[i % selectedTopics.length];
            const q = generateQuestion(topicInfo.topic, topicInfo.maxNum, historySet);
            const distractors = generateDistractors(q.answer);
            const options = shuffle([q.answer, ...distractors]);

            generatedQuestions.push({
                ...q,
                options,
                correctIndex: options.indexOf(q.answer),
            });

            historySet.add(q.key);
            newKeys.push(q.key);
        }

        // Shuffle question order so topics aren't in predictable sequence
        shuffle(generatedQuestions);

        // Save new keys to persistent history
        saveHistory([...history, ...newKeys]);

        return generatedQuestions;
    }

    // ─── Screen Management ───────────────────────────────────
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // ─── Configuration Screen ────────────────────────────────
    function getSelectedTopics() {
        const topics = [];
        for (const [topic, checkbox] of Object.entries(configUI.checkboxes)) {
            if (checkbox.checked) {
                const maxNum = parseInt(configUI.ranges[topic].value, 10);
                topics.push({ topic, maxNum });
            }
        }
        return topics;
    }

    function onStartClick() {
        const selected = getSelectedTopics();
        if (selected.length === 0) {
            configUI.errorMsg.classList.remove('hidden');
            return;
        }
        configUI.errorMsg.classList.add('hidden');

        // Build questions
        questions = buildStageQuestions(selected);
        currentIndex = 0;
        firstAttemptCorrect = 0;

        showScreen('question');
        presentQuestion();
    }

    // ─── Question Screen ─────────────────────────────────────
    function presentQuestion() {
        const q = questions[currentIndex];
        isFirstAttempt = true;

        // Update progress
        const num = currentIndex + 1;
        questionUI.progressText.textContent = t('progress', { n: num, total: QUESTIONS_PER_STAGE });
        questionUI.progressBar.style.width = `${(num / QUESTIONS_PER_STAGE) * 100}%`;

        // Display question
        questionUI.questionText.textContent = q.display;

        // Hide feedback
        questionUI.feedbackEmoji.classList.add('hidden');
        questionUI.feedbackEmoji.textContent = '';

        // Build option buttons
        const container = questionUI.optionsContainer;
        container.innerHTML = '';
        q.options.forEach((val, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option';
            btn.textContent = val;
            btn.dataset.index = idx;
            btn.addEventListener('click', () => onOptionClick(btn, idx));
            container.appendChild(btn);
        });
    }

    function onOptionClick(btn, idx) {
        const q = questions[currentIndex];
        const allBtns = questionUI.optionsContainer.querySelectorAll('.btn-option');

        if (idx === q.correctIndex) {
            // ✅ Correct
            btn.classList.add('correct');
            questionUI.feedbackEmoji.textContent = '😊';
            questionUI.feedbackEmoji.classList.remove('hidden');

            if (isFirstAttempt) firstAttemptCorrect++;

            // Disable all buttons
            allBtns.forEach(b => b.disabled = true);

            // Advance after delay
            setTimeout(() => {
                currentIndex++;
                if (currentIndex >= QUESTIONS_PER_STAGE) {
                    showSummary();
                } else {
                    presentQuestion();
                }
            }, FEEDBACK_DELAY_MS);
        } else {
            // ❌ Incorrect
            isFirstAttempt = false;
            btn.classList.add('wrong');
            btn.disabled = true;
            questionUI.feedbackEmoji.textContent = '😢';
            questionUI.feedbackEmoji.classList.remove('hidden');

            // Hide sad emoji after a moment so player can try again
            setTimeout(() => {
                questionUI.feedbackEmoji.classList.add('hidden');
            }, 900);
        }
    }

    // ─── Summary Screen ──────────────────────────────────────
    function showSummary() {
        summaryUI.score.textContent = t('summaryScore', { score: firstAttemptCorrect, total: QUESTIONS_PER_STAGE });
        showScreen('summary');
    }

    function onPlayAgainClick() {
        showScreen('config');
    }

    // ─── Event Binding ───────────────────────────────────────
    configUI.btnStart.addEventListener('click', onStartClick);
    summaryUI.btnPlayAgain.addEventListener('click', onPlayAgainClick);

    // Hide error message when any checkbox changes
    Object.values(configUI.checkboxes).forEach(cb => {
        cb.addEventListener('change', () => {
            configUI.errorMsg.classList.add('hidden');
        });
    });

    // Language toggle
    langUI.btnEn.addEventListener('click', () => switchLanguage('en'));
    langUI.btnHe.addEventListener('click', () => switchLanguage('he'));

    // Apply saved language on load
    applyLanguage();

})();
