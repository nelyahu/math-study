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
    // Each entry: [ISO alpha-2, English name, Hebrew name, Hebrew name with nikud, region]
    // Flags are loaded as PNG images from flagcdn.com
    const COUNTRIES = [
        // Europe (15)
        ['FR', 'France', 'צרפת', 'צָרְפַת', 'europe'],
        ['DE', 'Germany', 'גרמניה', 'גֶּרְמַנְיָה', 'europe'],
        ['IT', 'Italy', 'איטליה', 'אִיטַלְיָה', 'europe'],
        ['ES', 'Spain', 'ספרד', 'סְפָרַד', 'europe'],
        ['GB', 'United Kingdom', 'בריטניה', 'בְּרִיטַנְיָה', 'europe'],
        ['NL', 'Netherlands', 'הולנד', 'הוֹלַנְד', 'europe'],
        ['SE', 'Sweden', 'שוודיה', 'שְׁוֶדְיָה', 'europe'],
        ['NO', 'Norway', 'נורווגיה', 'נוֹרְוֶגְיָה', 'europe'],
        ['PL', 'Poland', 'פולין', 'פּוֹלִין', 'europe'],
        ['PT', 'Portugal', 'פורטוגל', 'פּוֹרְטוּגָל', 'europe'],
        ['GR', 'Greece', 'יוון', 'יָוָן', 'europe'],
        ['CH', 'Switzerland', 'שווייץ', 'שְׁוַיְץ', 'europe'],
        ['AT', 'Austria', 'אוסטריה', 'אוֹסְטְרִיָּה', 'europe'],
        ['BE', 'Belgium', 'בלגיה', 'בֶּלְגְיָה', 'europe'],
        ['DK', 'Denmark', 'דנמרק', 'דֶּנְמָרְק', 'europe'],

        // Asia (13)
        ['JP', 'Japan', 'יפן', 'יָפָן', 'asia'],
        ['CN', 'China', 'סין', 'סִין', 'asia'],
        ['KR', 'South Korea', 'דרום קוריאה', 'דְּרוֹם קוֹרֵיאָה', 'asia'],
        ['IN', 'India', 'הודו', 'הוֹדּוּ', 'asia'],
        ['TH', 'Thailand', 'תאילנד', 'תַּאיְלַנְד', 'asia'],
        ['IL', 'Israel', 'ישראל', 'יִשְׂרָאֵל', 'asia'],
        ['TR', 'Turkey', 'טורקיה', 'טוּרְקִיָּה', 'asia'],
        ['SA', 'Saudi Arabia', 'ערב הסעודית', 'עֲרָב הַסְּעוּדִית', 'asia'],
        ['AE', 'United Arab Emirates', 'איחוד האמירויות', 'אִיחוּד הָאֶמִירוּיּוֹת', 'asia'],
        ['VN', 'Vietnam', 'וייטנאם', 'וְיֶטְנָאם', 'asia'],
        ['ID', 'Indonesia', 'אינדונזיה', 'אִינְדּוֹנֶזְיָה', 'asia'],
        ['PH', 'Philippines', 'פיליפינים', 'פִילִיפִּינִים', 'asia'],
        ['MY', 'Malaysia', 'מלזיה', 'מָלֶזְיָה', 'asia'],

        // Americas (12)
        ['US', 'United States', 'ארצות הברית', 'אַרְצוֹת הַבְּרִית', 'americas'],
        ['CA', 'Canada', 'קנדה', 'קָנָדָה', 'americas'],
        ['MX', 'Mexico', 'מקסיקו', 'מֶקְסִיקוֹ', 'americas'],
        ['BR', 'Brazil', 'ברזיל', 'בְּרָזִיל', 'americas'],
        ['AR', 'Argentina', 'ארגנטינה', 'אַרְגֶּנְטִינָה', 'americas'],
        ['CL', 'Chile', 'צ\'ילה', 'צ\'ִילֶה', 'americas'],
        ['CO', 'Colombia', 'קולומביה', 'קוֹלוֹמְבִּיָה', 'americas'],
        ['PE', 'Peru', 'פרו', 'פֵּרוּ', 'americas'],
        ['CU', 'Cuba', 'קובה', 'קוּבָּה', 'americas'],
        ['JM', 'Jamaica', 'ג\'מייקה', 'גָ\'מַיְיקָה', 'americas'],
        ['PA', 'Panama', 'פנמה', 'פָּנָמָה', 'americas'],
        ['CR', 'Costa Rica', 'קוסטה ריקה', 'קוֹסְטָה רִיקָה', 'americas'],

        // Africa (10)
        ['EG', 'Egypt', 'מצרים', 'מִצְרַיִם', 'africa'],
        ['ZA', 'South Africa', 'דרום אפריקה', 'דְּרוֹם אַפְרִיקָה', 'africa'],
        ['NG', 'Nigeria', 'ניגריה', 'נִיגֶרְיָה', 'africa'],
        ['KE', 'Kenya', 'קניה', 'קֶנְיָה', 'africa'],
        ['MA', 'Morocco', 'מרוקו', 'מָרוֹקוֹ', 'africa'],
        ['ET', 'Ethiopia', 'אתיופיה', 'אֶתְיוֹפְּיָה', 'africa'],
        ['GH', 'Ghana', 'גאנה', 'גָ\'אנָה', 'africa'],
        ['TZ', 'Tanzania', 'טנזניה', 'טַנְזַנְיָה', 'africa'],
        ['TN', 'Tunisia', 'תוניסיה', 'תּוּנִיסְיָה', 'africa'],
        ['SN', 'Senegal', 'סנגל', 'סֶנֶגָל', 'africa'],

        // Oceania (5)
        ['AU', 'Australia', 'אוסטרליה', 'אוֹסְטְרַלְיָה', 'oceania'],
        ['NZ', 'New Zealand', 'ניו זילנד', 'נְיוּ זִילַנְד', 'oceania'],
        ['FJ', 'Fiji', 'פיג\'י', 'פִיגִ\'י', 'oceania'],
        ['PG', 'Papua New Guinea', 'פפואה גינאה החדשה', 'פָּפּוּאָה גִינֵאָה הַחֲדָשָׁה', 'oceania'],
        ['WS', 'Samoa', 'סמואה', 'סָמוֹאָה', 'oceania'],
    ];

    // Country coordinates (latitude, longitude) for world map display
    const COUNTRY_COORDS = {
        // Europe
        FR: [46.6, 2.2], DE: [51.2, 10.4], IT: [42.5, 12.6], ES: [40.5, -3.7],
        GB: [54.0, -2.0], NL: [52.1, 5.3], SE: [62.0, 15.0], NO: [62.0, 10.0],
        PL: [51.9, 19.1], PT: [39.4, -8.2], GR: [39.1, 21.8], CH: [46.8, 8.2],
        AT: [47.5, 14.6], BE: [50.5, 4.5], DK: [56.3, 9.5],
        // Asia
        JP: [36.2, 138.3], CN: [35.9, 104.2], KR: [35.9, 127.8], IN: [20.6, 79.0],
        TH: [15.9, 101.0], IL: [31.0, 34.9], TR: [39.0, 35.2], SA: [23.9, 45.1],
        AE: [23.4, 53.8], VN: [14.1, 108.3], ID: [-0.8, 113.9], PH: [12.9, 121.8],
        MY: [4.2, 102.0],
        // Americas
        US: [37.1, -95.7], CA: [56.1, -106.3], MX: [23.6, -102.6], BR: [-14.2, -51.9],
        AR: [-38.4, -63.6], CL: [-35.7, -71.5], CO: [4.6, -74.3], PE: [-9.2, -75.0],
        CU: [21.5, -77.8], JM: [18.1, -77.3], PA: [8.5, -80.8], CR: [9.7, -83.8],
        // Africa
        EG: [26.8, 30.8], ZA: [-30.6, 22.9], NG: [9.1, 8.7], KE: [-0.02, 37.9],
        MA: [31.8, -7.1], ET: [9.1, 40.5], GH: [8.0, -1.0], TZ: [-6.4, 34.9],
        TN: [33.9, 9.5], SN: [14.5, -14.5],
        // Oceania
        AU: [-25.3, 133.8], NZ: [-40.9, 174.9], FJ: [-17.7, 178.1],
        PG: [-6.3, 147.2], WS: [-13.8, -172.1],
    };

    // Parse into objects
    const countries = COUNTRIES.map(([code, nameEn, nameHe, nameHeNikud, region]) => ({
        code, nameEn, nameHe, nameHeNikud, region,
        lat: COUNTRY_COORDS[code]?.[0] ?? 0,
        lon: COUNTRY_COORDS[code]?.[1] ?? 0,
    }));

    /** Build flag image URL from country code */
    function getFlagUrl(code) {
        return `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
    }

    // ─── World Map ───────────────────────────────────────────
    const MAP_SHOW_DELAY = 3000;

    const WORLD_MAP_PATHS = [
        // North America
        'M83,56 L139,47 L236,50 L283,75 L339,117 L294,139 L275,181 L256,167 L231,200 L208,194 L172,158 L153,117 L97,78 Z',
        // Central America
        'M231,200 L250,211 L267,222 L275,228 L264,228 L247,219 L231,208 Z',
        // South America
        'M275,228 L300,228 L333,236 L397,256 L403,283 L386,308 L364,336 L339,364 L314,403 L292,378 L289,336 L281,294 L275,258 Z',
        // Europe
        'M472,150 L489,147 L514,131 L536,142 L558,147 L578,139 L589,122 L583,97 L583,56 L556,53 L531,64 L514,78 L500,89 L486,117 L472,131 Z',
        // UK/Ireland
        'M478,94 L492,89 L494,100 L486,108 Z',
        // Africa
        'M453,153 L522,147 L567,156 L592,164 L597,172 L639,219 L617,264 L600,303 L583,339 L558,350 L539,344 L528,314 L522,278 L519,244 L508,233 L486,231 L464,219 L453,192 Z',
        // Asia
        'M589,122 L597,167 L603,206 L625,211 L644,203 L672,183 L700,194 L717,228 L742,233 L778,242 L797,214 L819,192 L842,175 L864,153 L883,142 L900,119 L917,100 L944,92 L967,72 L950,56 L883,47 L806,44 L722,44 L667,56 L625,83 L600,103 Z',
        // Japan
        'M869,142 L878,128 L892,119 L894,131 L886,147 Z',
        // Australia
        'M817,289 L864,286 L906,300 L925,342 L903,356 L864,350 L825,347 L814,322 Z',
        // New Zealand
        'M964,361 L972,347 L978,339 L981,350 L975,367 L969,375 Z',
        // Indonesia
        'M775,250 L808,247 L836,250 L867,253 L878,264 L861,278 L825,278 L792,272 L775,264 Z',
        // Greenland
        'M336,75 L361,61 L403,44 L431,33 L444,44 L431,64 L403,78 L367,83 L342,83 Z',
    ];

    function createWorldMapSVG(lat, lon) {
        const mapW = 1000, mapH = 500;
        const cx = (lon + 180) / 360 * mapW;
        const cy = (90 - lat) / 180 * mapH;
        const pinTop = cy - 22;
        const pinLeft = cx - 10;
        const pinRight = cx + 10;

        const continents = WORLD_MAP_PATHS.map(d =>
            `<path d="${d}" fill="#8FBC8F" stroke="#6d9b6d" stroke-width="1.5" stroke-linejoin="round"/>`
        ).join('');

        return `<svg viewBox="0 0 ${mapW} ${mapH}" xmlns="http://www.w3.org/2000/svg" class="world-map-svg">
            <rect width="${mapW}" height="${mapH}" fill="#d4eaf7" rx="8"/>
            ${continents}
            <circle cx="${cx}" cy="${cy}" r="6" fill="none" stroke="#e74c3c" stroke-width="2.5">
                <animate attributeName="r" values="6;24;6" dur="1.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <g>
                <path d="M${cx},${cy} L${pinLeft},${pinTop} A10,10 0 1,1 ${pinRight},${pinTop} Z" fill="#e74c3c" stroke="#c0392b" stroke-width="1"/>
                <circle cx="${cx}" cy="${pinTop}" r="4.5" fill="white" opacity="0.9"/>
            </g>
        </svg>`;
    }

    function showWorldMap(lat, lon) {
        const container = questionUI.mapContainer;
        container.innerHTML = createWorldMapSVG(lat, lon);
        container.classList.remove('hidden');
    }

    function hideWorldMap() {
        const container = questionUI.mapContainer;
        container.classList.add('hidden');
        container.innerHTML = '';
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
        mapContainer:     document.getElementById('flags-world-map'),
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
        if (app.currentLang === 'he') {
            return app.nikudEnabled ? country.nameHeNikud : country.nameHe;
        }
        return country.nameEn;
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

        // Hide feedback and map
        questionUI.feedbackEmoji.classList.add('hidden');
        questionUI.feedbackEmoji.textContent = '';
        hideWorldMap();

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

            // Show world map with country location
            showWorldMap(q.country.lat, q.country.lon);

            setTimeout(() => {
                currentIndex++;
                if (currentIndex >= app.QUESTIONS_PER_STAGE) {
                    showSummary();
                } else {
                    presentQuestion();
                }
            }, MAP_SHOW_DELAY);
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
