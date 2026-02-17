/* ============================================================
   Kids Study App — Application Logic
   ============================================================ */

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────
    const QUESTIONS_PER_STAGE = 10;
    const MATH_HISTORY_CAP = 200;
    const MATH_HISTORY_KEY = 'mathStudy_questionHistory';
    const LANG_KEY = 'mathStudy_lang';
    const FEEDBACK_DELAY_MS = 1500;

    // ─── Translations ────────────────────────────────────────
    const translations = {
        en: {
            // Main menu
            mainTitle: '🎓 Kids Study',
            mainSubtitle: 'Choose a game!',
            mathGame: '🧮 Math Study',
            mathGameDesc: 'Practice addition, subtraction, multiplication & division',
            flagsGame: '🏳️ Flag Quiz',
            flagsGameDesc: 'Guess the country by its flag',
            backToMenu: '← Back to Menu',

            // Math config
            title: '🧮 Math Study',
            subtitle: "Pick your topics and let's practice!",
            addition: '➕ Addition',
            subtraction: '➖ Subtraction',
            multiplication: '✖️ Multiplication',
            division: '➗ Division',
            start: 'Start! 🚀',
            configError: 'Please select at least one topic.',

            // Flags config
            flagsGameSubtitle: 'Pick regions and start guessing!',
            flagsRegionEurope: '🇪🇺 Europe',
            flagsRegionAsia: '🌏 Asia',
            flagsRegionAmericas: '🌎 Americas',
            flagsRegionAfrica: '🌍 Africa',
            flagsRegionOceania: '🏝️ Oceania',
            flagsConfigError: 'Please select at least one region.',

            // Shared game
            progress: 'Question {n} / {total}',
            stageComplete: '🎉 Stage Complete!',
            summaryScore: '{score} / {total} on first try!',
            playAgain: 'Play Again 🔄',
        },
        he: {
            // Main menu
            mainTitle: '🎓 לימוד לילדים',
            mainSubtitle: '!בחרו משחק',
            mathGame: '🧮 תרגול חשבון',
            mathGameDesc: 'תרגול חיבור, חיסור, כפל וחילוק',
            flagsGame: '🏳️ חידון דגלים',
            flagsGameDesc: 'זהו את המדינה לפי הדגל',
            backToMenu: '→ חזרה לתפריט',

            // Math config
            title: '🧮 תרגול חשבון',
            subtitle: 'בחרו נושאים ובואו נתרגל!',
            addition: '➕ חיבור',
            subtraction: '➖ חיסור',
            multiplication: '✖️ כפל',
            division: '➗ חילוק',
            start: '🚀 !התחילו',
            configError: 'יש לבחור לפחות נושא אחד.',

            // Flags config
            flagsGameSubtitle: 'בחרו אזורים והתחילו לנחש!',
            flagsRegionEurope: '🇪🇺 אירופה',
            flagsRegionAsia: '🌏 אסיה',
            flagsRegionAmericas: '🌎 אמריקה',
            flagsRegionAfrica: '🌍 אפריקה',
            flagsRegionOceania: '🏝️ אוקיאניה',
            flagsConfigError: 'יש לבחור לפחות אזור אחד.',

            // Shared game
            progress: 'שאלה {n} מתוך {total}',
            stageComplete: '🎉 !השלב הושלם',
            summaryScore: '{score} מתוך {total} בניסיון הראשון!',
            playAgain: '🔄 שחקו שוב',
        },
    };

    let currentLang = localStorage.getItem(LANG_KEY) || 'en';

    // ─── DOM References ──────────────────────────────────────
    const screens = {
        menu:          document.getElementById('menu-screen'),
        config:        document.getElementById('config-screen'),
        question:      document.getElementById('question-screen'),
        summary:       document.getElementById('summary-screen'),
        flagsConfig:   document.getElementById('flags-config-screen'),
        flagsQuestion: document.getElementById('flags-question-screen'),
        flagsSummary:  document.getElementById('flags-summary-screen'),
    };

    const menuUI = {
        btnMath:  document.getElementById('btn-game-math'),
        btnFlags: document.getElementById('btn-game-flags'),
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
        btnBack:    document.getElementById('btn-back-math-config'),
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
        score:        document.getElementById('summary-score'),
        btnPlayAgain: document.getElementById('btn-play-again'),
        btnMenu:      document.getElementById('btn-menu-from-math'),
    };

    const langUI = {
        btnEn: document.getElementById('btn-lang-en'),
        btnHe: document.getElementById('btn-lang-he'),
    };

    // ─── Expose shared utilities for flags.js ────────────────
    window.KidsStudy = {
        get currentLang() { return currentLang; },
        QUESTIONS_PER_STAGE,
        FEEDBACK_DELAY_MS,
        t: null,           // set below
        showScreen: null,  // set below
        screens,
        randInt: null,
        shuffle: null,
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
    window.KidsStudy.t = t;

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

        // Update dynamic text if currently on math question screen
        if (screens.question.classList.contains('active') && mathQuestions.length > 0) {
            const num = mathCurrentIndex + 1;
            questionUI.progressText.textContent = t('progress', { n: num, total: QUESTIONS_PER_STAGE });
        }

        // Update math summary score if currently on summary screen
        if (screens.summary.classList.contains('active')) {
            summaryUI.score.textContent = t('summaryScore', { score: mathFirstAttemptCorrect, total: QUESTIONS_PER_STAGE });
        }

        // Notify flags module to refresh if active
        if (typeof window.FlagsGame !== 'undefined' && window.FlagsGame.onLanguageChange) {
            window.FlagsGame.onLanguageChange();
        }

        // Persist preference
        localStorage.setItem(LANG_KEY, currentLang);
    }

    function switchLanguage(lang) {
        currentLang = lang;
        applyLanguage();
    }

    // ─── Screen Management ───────────────────────────────────
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }
    window.KidsStudy.showScreen = showScreen;

    // ─── Math State ──────────────────────────────────────────
    let mathQuestions = [];
    let mathCurrentIndex = 0;
    let mathFirstAttemptCorrect = 0;
    let mathIsFirstAttempt = true;

    // ─── Math History (localStorage) ─────────────────────────
    function loadMathHistory() {
        try {
            const raw = localStorage.getItem(MATH_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveMathHistory(history) {
        if (history.length > MATH_HISTORY_CAP) {
            history = history.slice(history.length - MATH_HISTORY_CAP);
        }
        localStorage.setItem(MATH_HISTORY_KEY, JSON.stringify(history));
    }

    // ─── Random Helpers ──────────────────────────────────────
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    window.KidsStudy.randInt = randInt;

    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = randInt(0, i);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    window.KidsStudy.shuffle = shuffle;

    // ─── Math Question Generation ────────────────────────────
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
                    if (a < b) [a, b] = [b, a];
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
                    b = randInt(1, maxNum);
                    answer = randInt(0, maxNum);
                    a = b * answer;
                    op = '÷';
                    display = `${a} ÷ ${b} = ?`;
                    break;

                default:
                    continue;
            }

            const key = `${topic}|${a}|${op}|${b}`;
            if (historySet.has(key)) continue;

            return { topic, a, b, op, answer, display, key };
        }
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

    function buildMathStageQuestions(selectedTopics) {
        const history = loadMathHistory();
        const historySet = new Set(history);

        const generatedQuestions = [];
        const newKeys = [];

        for (let i = 0; i < QUESTIONS_PER_STAGE; i++) {
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

        shuffle(generatedQuestions);
        saveMathHistory([...history, ...newKeys]);

        return generatedQuestions;
    }

    // ─── Main Menu ───────────────────────────────────────────
    function onGameMathClick() {
        showScreen('config');
    }

    function onGameFlagsClick() {
        showScreen('flagsConfig');
    }

    // ─── Math Configuration Screen ──────────────────────────
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

    function onMathStartClick() {
        const selected = getSelectedTopics();
        if (selected.length === 0) {
            configUI.errorMsg.classList.remove('hidden');
            return;
        }
        configUI.errorMsg.classList.add('hidden');

        mathQuestions = buildMathStageQuestions(selected);
        mathCurrentIndex = 0;
        mathFirstAttemptCorrect = 0;

        showScreen('question');
        presentMathQuestion();
    }

    // ─── Math Question Screen ────────────────────────────────
    function presentMathQuestion() {
        const q = mathQuestions[mathCurrentIndex];
        mathIsFirstAttempt = true;

        const num = mathCurrentIndex + 1;
        questionUI.progressText.textContent = t('progress', { n: num, total: QUESTIONS_PER_STAGE });
        questionUI.progressBar.style.width = `${(num / QUESTIONS_PER_STAGE) * 100}%`;

        // Display question (always LTR since it's a math equation)
        questionUI.questionText.textContent = q.display;
        questionUI.questionText.dir = 'ltr';

        questionUI.feedbackEmoji.classList.add('hidden');
        questionUI.feedbackEmoji.textContent = '';

        const container = questionUI.optionsContainer;
        container.innerHTML = '';
        q.options.forEach((val, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option btn-option-number';
            btn.textContent = val;
            btn.dataset.index = idx;
            btn.addEventListener('click', () => onMathOptionClick(btn, idx));
            container.appendChild(btn);
        });
    }

    function onMathOptionClick(btn, idx) {
        const q = mathQuestions[mathCurrentIndex];
        const allBtns = questionUI.optionsContainer.querySelectorAll('.btn-option');

        if (idx === q.correctIndex) {
            btn.classList.add('correct');
            questionUI.feedbackEmoji.textContent = '😊';
            questionUI.feedbackEmoji.classList.remove('hidden');

            if (mathIsFirstAttempt) mathFirstAttemptCorrect++;

            allBtns.forEach(b => b.disabled = true);

            setTimeout(() => {
                mathCurrentIndex++;
                if (mathCurrentIndex >= QUESTIONS_PER_STAGE) {
                    showMathSummary();
                } else {
                    presentMathQuestion();
                }
            }, FEEDBACK_DELAY_MS);
        } else {
            mathIsFirstAttempt = false;
            btn.classList.add('wrong');
            btn.disabled = true;
            questionUI.feedbackEmoji.textContent = '😢';
            questionUI.feedbackEmoji.classList.remove('hidden');

            setTimeout(() => {
                questionUI.feedbackEmoji.classList.add('hidden');
            }, 900);
        }
    }

    // ─── Math Summary Screen ─────────────────────────────────
    function showMathSummary() {
        summaryUI.score.textContent = t('summaryScore', { score: mathFirstAttemptCorrect, total: QUESTIONS_PER_STAGE });
        showScreen('summary');
    }

    function onMathPlayAgainClick() {
        showScreen('config');
    }

    // ─── Event Binding ───────────────────────────────────────

    // Main menu
    menuUI.btnMath.addEventListener('click', onGameMathClick);
    menuUI.btnFlags.addEventListener('click', onGameFlagsClick);

    // Math config
    configUI.btnStart.addEventListener('click', onMathStartClick);
    configUI.btnBack.addEventListener('click', () => showScreen('menu'));

    Object.values(configUI.checkboxes).forEach(cb => {
        cb.addEventListener('change', () => {
            configUI.errorMsg.classList.add('hidden');
        });
    });

    // Math summary
    summaryUI.btnPlayAgain.addEventListener('click', onMathPlayAgainClick);
    summaryUI.btnMenu.addEventListener('click', () => showScreen('menu'));

    // Language toggle
    langUI.btnEn.addEventListener('click', function (e) {
        e.preventDefault();
        switchLanguage('en');
    });
    langUI.btnHe.addEventListener('click', function (e) {
        e.preventDefault();
        switchLanguage('he');
    });

    // Apply saved language on load
    applyLanguage();

})();
