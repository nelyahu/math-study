/* ============================================================
   Flag Quiz Game — Logic & Country Data
   ============================================================ */

(function () {
    'use strict';

    const app = window.KidsStudy;

    // ─── Constants ───────────────────────────────────────────
    const FLAGS_HISTORY_KEY = 'flagQuiz_history';
    const FLAGS_HISTORY_CAP = 100;

    // ─── Country Data (55 countries) ─────────────────────────
    // Each entry: [ISO alpha-2, English name, Hebrew name, region]
    // Flags are loaded as SVG images from flagcdn.com
    const COUNTRIES = [
        // Europe (15)
        ['FR', 'France', 'צרפת', 'europe'],
        ['DE', 'Germany', 'גרמניה', 'europe'],
        ['IT', 'Italy', 'איטליה', 'europe'],
        ['ES', 'Spain', 'ספרד', 'europe'],
        ['GB', 'United Kingdom', 'בריטניה', 'europe'],
        ['NL', 'Netherlands', 'הולנד', 'europe'],
        ['SE', 'Sweden', 'שוודיה', 'europe'],
        ['NO', 'Norway', 'נורווגיה', 'europe'],
        ['PL', 'Poland', 'פולין', 'europe'],
        ['PT', 'Portugal', 'פורטוגל', 'europe'],
        ['GR', 'Greece', 'יוון', 'europe'],
        ['CH', 'Switzerland', 'שווייץ', 'europe'],
        ['AT', 'Austria', 'אוסטריה', 'europe'],
        ['BE', 'Belgium', 'בלגיה', 'europe'],
        ['DK', 'Denmark', 'דנמרק', 'europe'],

        // Asia (13)
        ['JP', 'Japan', 'יפן', 'asia'],
        ['CN', 'China', 'סין', 'asia'],
        ['KR', 'South Korea', 'דרום קוריאה', 'asia'],
        ['IN', 'India', 'הודו', 'asia'],
        ['TH', 'Thailand', 'תאילנד', 'asia'],
        ['IL', 'Israel', 'ישראל', 'asia'],
        ['TR', 'Turkey', 'טורקיה', 'asia'],
        ['SA', 'Saudi Arabia', 'ערב הסעודית', 'asia'],
        ['AE', 'United Arab Emirates', 'איחוד האמירויות', 'asia'],
        ['VN', 'Vietnam', 'וייטנאם', 'asia'],
        ['ID', 'Indonesia', 'אינדונזיה', 'asia'],
        ['PH', 'Philippines', 'פיליפינים', 'asia'],
        ['MY', 'Malaysia', 'מלזיה', 'asia'],

        // Americas (12)
        ['US', 'United States', 'ארצות הברית', 'americas'],
        ['CA', 'Canada', 'קנדה', 'americas'],
        ['MX', 'Mexico', 'מקסיקו', 'americas'],
        ['BR', 'Brazil', 'ברזיל', 'americas'],
        ['AR', 'Argentina', 'ארגנטינה', 'americas'],
        ['CL', 'Chile', 'צ\'ילה', 'americas'],
        ['CO', 'Colombia', 'קולומביה', 'americas'],
        ['PE', 'Peru', 'פרו', 'americas'],
        ['CU', 'Cuba', 'קובה', 'americas'],
        ['JM', 'Jamaica', 'ג\'מייקה', 'americas'],
        ['PA', 'Panama', 'פנמה', 'americas'],
        ['CR', 'Costa Rica', 'קוסטה ריקה', 'americas'],

        // Africa (10)
        ['EG', 'Egypt', 'מצרים', 'africa'],
        ['ZA', 'South Africa', 'דרום אפריקה', 'africa'],
        ['NG', 'Nigeria', 'ניגריה', 'africa'],
        ['KE', 'Kenya', 'קניה', 'africa'],
        ['MA', 'Morocco', 'מרוקו', 'africa'],
        ['ET', 'Ethiopia', 'אתיופיה', 'africa'],
        ['GH', 'Ghana', 'גאנה', 'africa'],
        ['TZ', 'Tanzania', 'טנזניה', 'africa'],
        ['TN', 'Tunisia', 'תוניסיה', 'africa'],
        ['SN', 'Senegal', 'סנגל', 'africa'],

        // Oceania (5)
        ['AU', 'Australia', 'אוסטרליה', 'oceania'],
        ['NZ', 'New Zealand', 'ניו זילנד', 'oceania'],
        ['FJ', 'Fiji', 'פיג\'י', 'oceania'],
        ['PG', 'Papua New Guinea', 'פפואה גינאה החדשה', 'oceania'],
        ['WS', 'Samoa', 'סמואה', 'oceania'],
    ];

    // Parse into objects
    const countries = COUNTRIES.map(([code, nameEn, nameHe, region]) => ({
        code, nameEn, nameHe, region,
    }));

    /** Build flag image URL from country code */
    function getFlagUrl(code) {
        return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
    }

    // ─── DOM References ──────────────────────────────────────
    const configUI = {
        checkboxes: {
            europe:   document.getElementById('chk-region-europe'),
            asia:     document.getElementById('chk-region-asia'),
            americas: document.getElementById('chk-region-americas'),
            africa:   document.getElementById('chk-region-africa'),
            oceania:  document.getElementById('chk-region-oceania'),
        },
        btnStart:  document.getElementById('btn-start-flags'),
        btnBack:   document.getElementById('btn-back-flags-config'),
        errorMsg:  document.getElementById('flags-config-error'),
    };

    const questionUI = {
        progressBar:      document.getElementById('flags-progress-bar'),
        progressText:     document.getElementById('flags-progress-text'),
        flagDisplay:      document.getElementById('flag-display'),
        feedbackEmoji:    document.getElementById('flags-feedback-emoji'),
        optionsContainer: document.getElementById('flags-options-container'),
    };

    const summaryUI = {
        score:        document.getElementById('flags-summary-score'),
        btnPlayAgain: document.getElementById('btn-flags-play-again'),
        btnMenu:      document.getElementById('btn-menu-from-flags'),
    };

    // ─── State ───────────────────────────────────────────────
    let flagQuestions = [];
    let currentIndex = 0;
    let firstAttemptCorrect = 0;
    let isFirstAttempt = true;
    let selectedRegions = [];

    // ─── History ─────────────────────────────────────────────
    function loadHistory() {
        try {
            const raw = localStorage.getItem(FLAGS_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    function saveHistory(history) {
        if (history.length > FLAGS_HISTORY_CAP) {
            history = history.slice(history.length - FLAGS_HISTORY_CAP);
        }
        localStorage.setItem(FLAGS_HISTORY_KEY, JSON.stringify(history));
    }

    // ─── Helpers ─────────────────────────────────────────────
    function getCountryName(country) {
        return app.currentLang === 'he' ? country.nameHe : country.nameEn;
    }

    function getCountriesByRegions(regions) {
        return countries.filter(c => regions.includes(c.region));
    }

    // ─── Question Generation ─────────────────────────────────
    function buildFlagQuestions(regions) {
        const pool = getCountriesByRegions(regions);
        const history = loadHistory();
        const historySet = new Set(history);

        // Filter available (not in history)
        let available = pool.filter(c => !historySet.has(c.code));

        // If not enough available, clear history
        if (available.length < app.QUESTIONS_PER_STAGE) {
            localStorage.removeItem(FLAGS_HISTORY_KEY);
            available = [...pool];
        }

        // Shuffle and pick up to QUESTIONS_PER_STAGE
        app.shuffle(available);
        const picked = available.slice(0, app.QUESTIONS_PER_STAGE);

        const generatedQuestions = [];
        const newCodes = [];

        for (const country of picked) {
            // Build distractors — prefer same region
            const sameRegion = pool.filter(c => c.region === country.region && c.code !== country.code);
            const otherRegion = pool.filter(c => c.region !== country.region);

            app.shuffle(sameRegion);
            app.shuffle(otherRegion);

            const distractors = [];
            // Fill from same region first
            for (const d of sameRegion) {
                if (distractors.length >= 3) break;
                distractors.push(d);
            }
            // Fill remaining from other regions
            for (const d of otherRegion) {
                if (distractors.length >= 3) break;
                distractors.push(d);
            }

            const options = app.shuffle([country, ...distractors]);

            generatedQuestions.push({
                country,
                options,
                correctIndex: options.indexOf(country),
            });

            newCodes.push(country.code);
        }

        app.shuffle(generatedQuestions);
        saveHistory([...history.filter(h => !newCodes.includes(h)), ...newCodes]);

        return generatedQuestions;
    }

    // ─── Config Screen ───────────────────────────────────────
    function getSelectedRegions() {
        const regions = [];
        for (const [region, cb] of Object.entries(configUI.checkboxes)) {
            if (cb.checked) regions.push(region);
        }
        return regions;
    }

    function onStartClick() {
        selectedRegions = getSelectedRegions();
        if (selectedRegions.length === 0) {
            configUI.errorMsg.classList.remove('hidden');
            return;
        }
        configUI.errorMsg.classList.add('hidden');

        flagQuestions = buildFlagQuestions(selectedRegions);
        currentIndex = 0;
        firstAttemptCorrect = 0;

        app.showScreen('flagsQuestion');
        presentQuestion();
    }

    // ─── Question Screen ─────────────────────────────────────
    function presentQuestion() {
        const q = flagQuestions[currentIndex];
        isFirstAttempt = true;

        const num = currentIndex + 1;
        questionUI.progressText.textContent = app.t('progress', { n: num, total: app.QUESTIONS_PER_STAGE });
        questionUI.progressBar.style.width = `${(num / app.QUESTIONS_PER_STAGE) * 100}%`;

        // Display flag image
        questionUI.flagDisplay.innerHTML = '';
        const img = document.createElement('img');
        img.src = getFlagUrl(q.country.code);
        img.alt = 'Flag';
        img.draggable = false;
        questionUI.flagDisplay.appendChild(img);

        // Hide feedback
        questionUI.feedbackEmoji.classList.add('hidden');
        questionUI.feedbackEmoji.textContent = '';

        // Build option buttons with country names
        const container = questionUI.optionsContainer;
        container.innerHTML = '';
        q.options.forEach((country, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn-option btn-option-text';
            btn.textContent = getCountryName(country);
            btn.dataset.index = idx;
            btn.addEventListener('click', () => onOptionClick(btn, idx));
            container.appendChild(btn);
        });
    }

    function onOptionClick(btn, idx) {
        const q = flagQuestions[currentIndex];
        const allBtns = questionUI.optionsContainer.querySelectorAll('.btn-option');

        if (idx === q.correctIndex) {
            btn.classList.add('correct');
            questionUI.feedbackEmoji.textContent = '😊';
            questionUI.feedbackEmoji.classList.remove('hidden');

            if (isFirstAttempt) firstAttemptCorrect++;

            allBtns.forEach(b => b.disabled = true);

            setTimeout(() => {
                currentIndex++;
                if (currentIndex >= app.QUESTIONS_PER_STAGE) {
                    showSummary();
                } else {
                    presentQuestion();
                }
            }, app.FEEDBACK_DELAY_MS);
        } else {
            isFirstAttempt = false;
            btn.classList.add('wrong');
            btn.disabled = true;
            questionUI.feedbackEmoji.textContent = '😢';
            questionUI.feedbackEmoji.classList.remove('hidden');

            setTimeout(() => {
                questionUI.feedbackEmoji.classList.add('hidden');
            }, 900);
        }
    }

    // ─── Summary Screen ──────────────────────────────────────
    function showSummary() {
        summaryUI.score.textContent = app.t('summaryScore', { score: firstAttemptCorrect, total: app.QUESTIONS_PER_STAGE });
        app.showScreen('flagsSummary');
    }

    // ─── Language Change Handler ─────────────────────────────
    function onLanguageChange() {
        // Update flag question option buttons if on question screen
        if (app.screens.flagsQuestion.classList.contains('active') && flagQuestions.length > 0) {
            const q = flagQuestions[currentIndex];
            const num = currentIndex + 1;
            questionUI.progressText.textContent = app.t('progress', { n: num, total: app.QUESTIONS_PER_STAGE });

            // Update option button text to new language
            const btns = questionUI.optionsContainer.querySelectorAll('.btn-option');
            btns.forEach((btn, idx) => {
                if (!btn.classList.contains('wrong') && !btn.classList.contains('correct')) {
                    btn.textContent = getCountryName(q.options[idx]);
                } else if (btn.classList.contains('correct')) {
                    btn.textContent = getCountryName(q.options[idx]);
                }
                // Keep wrong buttons text too for consistency
                btn.textContent = getCountryName(q.options[idx]);
            });
        }

        // Update summary score if on summary screen
        if (app.screens.flagsSummary.classList.contains('active')) {
            summaryUI.score.textContent = app.t('summaryScore', { score: firstAttemptCorrect, total: app.QUESTIONS_PER_STAGE });
        }
    }

    // ─── Event Binding ───────────────────────────────────────
    configUI.btnStart.addEventListener('click', onStartClick);
    configUI.btnBack.addEventListener('click', () => app.showScreen('menu'));

    // Hide error on checkbox change
    Object.values(configUI.checkboxes).forEach(cb => {
        cb.addEventListener('change', () => {
            configUI.errorMsg.classList.add('hidden');
        });
    });

    summaryUI.btnPlayAgain.addEventListener('click', () => {
        app.showScreen('flagsConfig');
    });
    summaryUI.btnMenu.addEventListener('click', () => {
        app.showScreen('menu');
    });

    // ─── Expose for language change callback ─────────────────
    window.FlagsGame = {
        onLanguageChange,
    };

})();
