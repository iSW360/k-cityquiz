const difficultySelector = document.getElementById('difficulty-selector');
const quizContainer = document.getElementById('quiz-container');
const level1Btn = document.getElementById('level-1-btn');
const level2Btn = document.getElementById('level-2-btn');

const questionTextElement = document.getElementById('question-text');
const optionsArea = document.getElementById('options-area');
const feedbackTextElement = document.getElementById('feedback-text');
const progressArea = document.getElementById('progress-area');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const nextQuestionBtn = document.getElementById('next-question-btn');
const restartBtn = document.getElementById('restart-btn');
const mapErrorInfo = document.getElementById('map-error-info');
const hintBtn = document.getElementById('hint-btn');
const hintsRemainingElement = document.getElementById('hints-remaining');

let map, marker, geoJsonLayer, autoNextTimer, countdownInterval;
let totalHintsUsed = 0, currentQuestionHintUsed = false;

// --- Timer ---
let questionTimer = null, questionTimeLeft = 0;
let questionTimeLimit = 10;

// --- Best score / Stats / Time ---
let gameStartTime = null, gameElapsedSec = 0, answerLog = [];
const LS_BEST  = 'kcityquiz_seoul_en_best';
const LS_STATS = 'kcityquiz_seoul_en_stats';
const LS_DAILY = 'kcityquiz_seoul_en_daily';
let isDailyMode = false;

// --- Seoul District Data ---
const locations = [
    { name: "종로구 Jongno-gu",     lat: 37.5730, lng: 126.9794, zoom: 11, geoName: "종로구",   hint: "The historic heart of Seoul, home to Gyeongbokgung Palace, Cheong Wa Dae, and Gwanghwamun Square." },
    { name: "중구 Jung-gu",          lat: 37.5641, lng: 126.9979, zoom: 11, geoName: "중구",     hint: "Home to Namsan Tower, Myeongdong shopping street, and Dongdaemun Design Plaza (DDP)." },
    { name: "용산구 Yongsan-gu",     lat: 37.5326, lng: 126.9904, zoom: 11, geoName: "용산구",   hint: "Home to the National Museum of Korea, Itaewon international district, and Yongsan Park." },
    { name: "성동구 Seongdong-gu",   lat: 37.5633, lng: 127.0371, zoom: 11, geoName: "성동구",   hint: "Known for Seoul Forest and the trendy Seongsu-dong area, famous for its artisan shoe street." },
    { name: "광진구 Gwangjin-gu",    lat: 37.5385, lng: 127.0824, zoom: 11, geoName: "광진구",   hint: "Home to Children's Grand Park, Ttukseom Han River Park, and the vibrant Konkuk University area." },
    { name: "동대문구 Dongdaemun-gu",lat: 37.5744, lng: 127.0400, zoom: 11, geoName: "동대문구", hint: "Known for Gyeongdong Market (traditional medicine), Seoul City University, and Hankuk University of Foreign Studies." },
    { name: "중랑구 Jungnang-gu",    lat: 37.6065, lng: 127.0927, zoom: 11, geoName: "중랑구",   hint: "Famous for Jungnangcheon Rose Festival and Yongmasan Mountain hiking." },
    { name: "성북구 Seongbuk-gu",    lat: 37.5891, lng: 127.0182, zoom: 11, geoName: "성북구",   hint: "A district at the foot of Bukhansan Mountain, home to foreign embassies and Korea University." },
    { name: "강북구 Gangbuk-gu",     lat: 37.6396, lng: 127.0257, zoom: 11, geoName: "강북구",   hint: "Gateway to Bukhansan National Park and home to the 'Dream Forest of North Seoul'." },
    { name: "도봉구 Dobong-gu",      lat: 37.6688, lng: 127.0471, zoom: 11, geoName: "도봉구",   hint: "A northern district known for Dobongsan Mountain and the Dooly Museum." },
    { name: "노원구 Nowon-gu",       lat: 37.6542, lng: 127.0568, zoom: 11, geoName: "노원구",   hint: "Flanked by Bullamsan and Suraksan mountains, and home to the famous Junggye-dong private education district." },
    { name: "은평구 Eunpyeong-gu",   lat: 37.6027, lng: 126.9291, zoom: 11, geoName: "은평구",   hint: "A pleasant residential district with Jingwansa Temple and a newly developed Bukhansan Hanok Village." },
    { name: "서대문구 Seodaemun-gu", lat: 37.5791, lng: 126.9368, zoom: 11, geoName: "서대문구", hint: "Home to Dongnimmun (Independence Gate), Seodaemun Prison History Hall, and Yonsei University." },
    { name: "마포구 Mapo-gu",        lat: 37.5662, lng: 126.9016, zoom: 11, geoName: "마포구",   hint: "Known for the vibrant Hongdae area, Mangwon-dong, and Sangam World Cup Stadium." },
    { name: "양천구 Yangcheon-gu",   lat: 37.5169, lng: 126.8665, zoom: 11, geoName: "양천구",   hint: "A major education hub in western Seoul, home to the Mokdong new town and SBS broadcasting station." },
    { name: "강서구 Gangseo-gu",     lat: 37.5509, lng: 126.8495, zoom: 11, geoName: "강서구",   hint: "The western gateway to Seoul with Gimpo Airport and the newly developed Magok district (Seoul Botanic Park)." },
    { name: "구로구 Guro-gu",        lat: 37.4954, lng: 126.8875, zoom: 11, geoName: "구로구",   hint: "Transformed from an old industrial complex into a thriving IT venture hub (Digital Complex)." },
    { name: "금천구 Geumcheon-gu",   lat: 37.4568, lng: 126.8952, zoom: 11, geoName: "금천구",   hint: "A southwestern district dense with Gasan Digital Complex and large outlet shopping malls." },
    { name: "영등포구 Yeongdeungpo-gu", lat: 37.5264, lng: 126.8962, zoom: 11, geoName: "영등포구", hint: "Home to Yeouido's National Assembly, the financial district, and the iconic 63 Building." },
    { name: "동작구 Dongjak-gu",     lat: 37.5124, lng: 126.9395, zoom: 11, geoName: "동작구",   hint: "Home to the Seoul National Cemetery and the famous Noryangjin Fish Market." },
    { name: "관악구 Gwanak-gu",      lat: 37.4784, lng: 126.9515, zoom: 11, geoName: "관악구",   hint: "A southern district known for Seoul National University and Gwanaksan Mountain hiking trails." },
    { name: "서초구 Seocho-gu",      lat: 37.4837, lng: 127.0324, zoom: 11, geoName: "서초구",   hint: "Home to the Seoul Arts Center, the Supreme Court, and the massive Gangnam Express Bus Terminal." },
    { name: "강남구 Gangnam-gu",     lat: 37.4959, lng: 127.0664, zoom: 11, geoName: "강남구",   hint: "The trend-setting heart of modern Seoul, with COEX, Garosu-gil, and the Apgujeong Rodeo Street." },
    { name: "송파구 Songpa-gu",      lat: 37.5145, lng: 127.1061, zoom: 11, geoName: "송파구",   hint: "A major tourist district featuring Lotte World Tower, Seokchon Lake, and Olympic Park." },
    { name: "강동구 Gangdong-gu",    lat: 37.5301, lng: 127.1238, zoom: 11, geoName: "강동구",   hint: "A residential district known for the Amsa-dong Prehistoric Settlement Site and Herb Astronomy Park." }
];

let shuffledGameLocations = [], currentQuestionIndex = 0, score = 0;
let correctAnswerName = '', numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const PROVINCE_VIEW_ZOOM = 10;
const CITY_VIEW_DELAY = 1000;

// =============================================
// Daily Challenge
// =============================================
function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyLocations() {
    const seed = parseInt(getTodayKey().replace(/-/g, ''), 10) + 100;
    const arr = [...locations];
    let s = seed;
    function rand() {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, MAX_QUESTIONS_PER_GAME);
}

function getDailyStatus() {
    const saved = JSON.parse(localStorage.getItem(LS_DAILY) || 'null');
    return (saved && saved.date === getTodayKey()) ? saved : null;
}

function saveDailyResult(score, elapsed) {
    localStorage.setItem(LS_DAILY, JSON.stringify({ date: getTodayKey(), score, elapsed }));
}

function startDailyChallenge() {
    const status = getDailyStatus();
    if (status) {
        alert(`You've already completed today's Seoul challenge! 🎉\nScore: ${status.score} / ${MAX_QUESTIONS_PER_GAME}\nTry again tomorrow!`);
        return;
    }
    isDailyMode = true;
    isKidsMode = false;
    numOptions = 8; 
    questionTimeLimit = 15;
    difficultySelector.style.display = 'none';
    quizContainer.style.display = 'block';
    startGame(true);
}

function getColorForRegion(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return `hsl(${(hash * 13) % 360}, 65%, ${45 + (hash % 20)}%)`;
}

// =============================================
// Timer UI
// =============================================
function createTimerUI() {
    const existing = document.getElementById('question-timer');
    if (existing) existing.remove();
    const timerEl = document.createElement('div');
    timerEl.id = 'question-timer';
    timerEl.className = 'flex items-center justify-center gap-2 mb-3';
    timerEl.innerHTML = `
        <div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-blue-500" style="width:100%"></div>
        </div>
        <span id="timer-text" class="text-sm font-bold text-blue-600 min-w-[2.5rem] text-right">${questionTimeLimit}s</span>
    `;
    const questionArea = document.getElementById('question-area');
    questionArea.parentNode.insertBefore(timerEl, questionArea);
}

function startQuestionTimer() {
    if (questionTimer) clearInterval(questionTimer);
    questionTimeLeft = questionTimeLimit;
    createTimerUI();
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    questionTimer = setInterval(() => {
        questionTimeLeft--;
        const pct = (questionTimeLeft / questionTimeLimit) * 100;
        if (timerBar) timerBar.style.width = pct + '%';
        if (timerText) timerText.textContent = questionTimeLeft + 's';
        if (timerBar) {
            if (questionTimeLeft <= 3) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500';
                if (timerText) timerText.className = 'text-sm font-bold text-red-600 min-w-[2.5rem] text-right';
            } else if (questionTimeLeft <= 6) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-amber-500';
                if (timerText) timerText.className = 'text-sm font-bold text-amber-600 min-w-[2.5rem] text-right';
            }
        }
        if (questionTimeLeft <= 0) { clearInterval(questionTimer); handleTimeOut(); }
    }, 1000);
}

function stopQuestionTimer() { if (questionTimer) { clearInterval(questionTimer); questionTimer = null; } }

function handleTimeOut() {
    stopQuestionTimer();
    answerLog.push({ name: correctAnswerName, correct: false, timeTaken: questionTimeLimit });
    saveLocationStats(correctAnswerName, false);
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
        if (btn.dataset.key === correctAnswerName) {
            btn.classList.remove('opacity-70');
            btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
        }
    });
    feedbackTextElement.innerHTML = `<span class="text-orange-600 font-bold">⏰ Time's up! The answer was <strong>${correctAnswerName}</strong>.</span>`;
    const isLast = currentQuestionIndex >= shuffledGameLocations.length - 1;
    const btnLabel = isLast ? 'Results' : 'Next';
    nextQuestionBtn.textContent = `${btnLabel} (3s)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';
    let countdown = 3;
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = `${btnLabel} (${countdown}s)`;
        else clearInterval(countdownInterval);
    }, 1000);
    autoNextTimer = setTimeout(() => {
        if (!isLast) { currentQuestionIndex++; loadQuestion(); } else endGame();
    }, 3000);
}

async function initMap() {
    if (mapErrorInfo) mapErrorInfo.textContent = 'Loading map...';
    if (map) map.remove();
    map = L.map('map', { zoomControl: false }).setView([37.5665, 126.9780], 10);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO', subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    const geoJsonUrl = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json';
    try {
        const response = await fetch(geoJsonUrl);
        const data = await response.json();
        const seoulData = { type: "FeatureCollection", features: data.features.filter(f => f.properties.code && f.properties.code.startsWith('11')) };
        if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
        geoJsonLayer = L.geoJSON(seoulData, {
            style: f => { const c = getColorForRegion(f.properties.name || ''); return { color: c, weight: 1.5, opacity: 0.8, fillOpacity: 0.3, fillColor: c }; },
            onEachFeature: (f, layer) => {
                layer.on({
                    mouseover: e => e.target.setStyle({ weight: 3, fillOpacity: 0.5 }),
                    mouseout:  e => geoJsonLayer && geoJsonLayer.resetStyle(e.target)
                });
            }
        }).addTo(map);
        if (mapErrorInfo) mapErrorInfo.textContent = '';
    } catch (e) { if (mapErrorInfo) mapErrorInfo.textContent = 'Failed to load district data.'; }
    marker = L.marker([0, 0], { icon: L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', iconSize: [25, 41], iconAnchor: [12, 41] }) });
}

function highlightCurrentQuestionRegion(geoName) {
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
            if ((layer.feature.properties.name || '') === geoName) {
                layer.setStyle({ weight: 4, color: '#c00', fillOpacity: 0.6, fillColor: '#ffeb3b' });
                layer.bringToFront();
            } else { geoJsonLayer.resetStyle(layer); }
        });
    }
}

let isKidsMode = false;

function selectDifficulty(level) {
    isKidsMode = (level === 1);
    numOptions = (level === 2) ? 8 : 4;
    questionTimeLimit = (level === 2) ? 15 : 10;
    difficultySelector.style.display = 'none';
    quizContainer.style.display = 'block';
    startGame();
}

function showDifficultyScreen() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();
    quizContainer.style.display = 'none';
    difficultySelector.style.display = 'block';
    feedbackTextElement.textContent = '';
    optionsArea.innerHTML = '';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'none';
    isDailyMode = false;
}

async function startGame(daily = false) {
    isDailyMode = daily;
    score = 0; currentQuestionIndex = 0; totalHintsUsed = 0;
    currentQuestionHintUsed = false;
    hintsRemainingElement.textContent = 0;
    gameStartTime = Date.now(); gameElapsedSec = 0; answerLog = [];
    shuffledGameLocations = daily ? getDailyLocations() : shuffleArray([...locations]).slice(0, MAX_QUESTIONS_PER_GAME);
    totalQuestionsElement.textContent = shuffledGameLocations.length;
    progressArea.style.display = 'block';
    if (!map) { await initMap(); }
    else {
        if (marker && map.hasLayer(marker)) marker.remove();
        if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    }
    restartBtn.textContent = 'Restart';
    hintBtn.style.display = 'inline-flex';
    hintBtn.disabled = false;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= shuffledGameLocations.length) { endGame(); return; }
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const loc = shuffledGameLocations[currentQuestionIndex];
    correctAnswerName = loc.name;
    currentQuestionHintUsed = false;
    questionTimeLeft = questionTimeLimit;
    questionTextElement.textContent = "Where is this district?";
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    highlightCurrentQuestionRegion(loc.geoName);
    const latLng = [loc.lat, loc.lng];
    if (marker) marker.setLatLng(latLng).addTo(map);
    map.setView([37.5665, 126.9780], PROVINCE_VIEW_ZOOM);
    setTimeout(() => { if (map) map.flyTo(latLng, loc.zoom || 11, { duration: 1 }); }, CITY_VIEW_DELAY);
    optionsArea.innerHTML = '';
    generateOptions(correctAnswerName).forEach(optName => {
        const btn = document.createElement('button');
        btn.dataset.key = optName;
        btn.className = "option-button w-full bg-white hover:bg-blue-100 text-blue-700 py-1 px-2 border border-blue-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none flex flex-col items-center justify-center leading-tight";
        const spaceIdx = optName.indexOf(' ');
        if (spaceIdx !== -1) {
            const korean = optName.substring(0, spaceIdx);
            const english = optName.substring(spaceIdx + 1);
            btn.innerHTML = `<span class="text-xs sm:text-sm font-bold">${korean}</span><span class="text-[10px] sm:text-xs font-medium text-blue-400">${english}</span>`;
        } else {
            btn.innerHTML = `<span class="text-xs sm:text-sm font-bold">${optName}</span>`;
        }
        btn.onclick = () => handleAnswer(optName, btn);
        optionsArea.appendChild(btn);
    });
    feedbackTextElement.textContent = '';
    nextQuestionBtn.style.display = 'none';
    if (isKidsMode) {
        hintBtn.style.display = 'none';
        setTimeout(() => {
            feedbackTextElement.textContent = `💡 Hint: ${maskHint(loc.hint, correctAnswerName)}`;
            feedbackTextElement.className = 'text-md font-medium text-amber-600';
        }, CITY_VIEW_DELAY + 500);
    } else {
        hintBtn.style.display = 'inline-flex';
        setTimeout(() => startQuestionTimer(), CITY_VIEW_DELAY + 1000);
    }
}

function handleAnswer(selectedName, buttonElement) {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    });
    const loc = shuffledGameLocations[currentQuestionIndex];
    const isCorrect = selectedName === correctAnswerName;
    const timeTaken = questionTimeLimit - questionTimeLeft;
    answerLog.push({ name: correctAnswerName, correct: isCorrect, timeTaken });
    saveLocationStats(correctAnswerName, isCorrect);
    const timeBonus = questionTimeLeft > 0 ? (questionTimeLeft / questionTimeLimit) : 0;
    if (isCorrect) {
        let gained = currentQuestionHintUsed ? 0.5 : Math.round((0.5 + timeBonus * 0.5) * 10) / 10;
        score += gained;
        const timeMsg = currentQuestionHintUsed ? '' : ' ⚡ Speed bonus!';
        feedbackTextElement.innerHTML = `<span class="text-green-600 font-bold">Correct! 👏 (+${gained}pt)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        feedbackTextElement.innerHTML = `<span class="text-red-600 font-bold">Wrong! The answer was <strong>${correctAnswerName}</strong>. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-700');
        Array.from(optionsArea.children).forEach(btn => {
            if (btn.dataset.key === correctAnswerName) {
                btn.classList.remove('opacity-70');
                btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
            }
        });
    }
    let countdown = 4;
    const isLast = currentQuestionIndex >= shuffledGameLocations.length - 1;
    const btnLabel = isLast ? 'Results' : 'Next';
    nextQuestionBtn.textContent = `${btnLabel} (${countdown}s)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = `${btnLabel} (${countdown}s)`;
        else clearInterval(countdownInterval);
    }, 1000);
    autoNextTimer = setTimeout(() => {
        if (!isLast) { currentQuestionIndex++; loadQuestion(); } else endGame();
    }, 4000);
}

function useHint() {
    if (!currentQuestionHintUsed) { totalHintsUsed++; currentQuestionHintUsed = true; hintsRemainingElement.textContent = totalHintsUsed; }
    const loc = shuffledGameLocations[currentQuestionIndex];
    feedbackTextElement.textContent = `💡 Hint: ${maskHint(loc.hint, correctAnswerName)}`;
    feedbackTextElement.className = 'text-md font-medium text-amber-600';
}

function endGame() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();
    gameElapsedSec = Math.round((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(gameElapsedSec / 60), secs = gameElapsedSec % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const roundedScore = Math.round(score * 10) / 10;
    const total = shuffledGameLocations.length;
    const correctCount = answerLog.filter(l => l.correct).length;
    const accuracy = Math.round((correctCount / total) * 100);
    const avgTime = answerLog.length ? Math.round(answerLog.reduce((s, l) => s + l.timeTaken, 0) / answerLog.length) : 0;
    const prev = JSON.parse(localStorage.getItem(LS_BEST) || 'null');
    const isNewBest = !prev || roundedScore > prev.score || (roundedScore === prev.score && gameElapsedSec < prev.elapsed);
    if (isNewBest) localStorage.setItem(LS_BEST, JSON.stringify({ score: roundedScore, elapsed: gameElapsedSec, date: new Date().toLocaleDateString('en-US') }));
    const bestData = JSON.parse(localStorage.getItem(LS_BEST));
    if (isDailyMode) saveDailyResult(roundedScore, gameElapsedSec);
    questionTextElement.textContent = `Game Over! Final Score: ${roundedScore} / ${total}`;
    progressArea.style.display = 'none';
    hintBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    restartBtn.textContent = 'Restart';
    const dailyBanner = isDailyMode ? `<div class="flex items-center justify-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-bold mb-4">📅 Daily Seoul Challenge Complete! ${getTodayKey()}</div>` : '';
    optionsArea.innerHTML = `
      <div class="col-span-4 space-y-4">
        ${dailyBanner}
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p class="text-xs text-blue-400 font-semibold mb-1">Score</p>
            <p class="text-2xl font-extrabold text-blue-600">${roundedScore}<span class="text-sm font-normal text-blue-400">/${total}</span></p>
          </div>
          <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p class="text-xs text-emerald-400 font-semibold mb-1">Accuracy</p>
            <p class="text-2xl font-extrabold text-emerald-600">${accuracy}<span class="text-sm font-normal text-emerald-400">%</span></p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p class="text-xs text-amber-400 font-semibold mb-1">Time</p>
            <p class="text-lg font-extrabold text-amber-600">${timeStr}</p>
            <p class="text-xs text-amber-400">avg ${avgTime}s/Q</p>
          </div>
        </div>
        <div class="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100">
          <span class="text-sm font-bold text-blue-700">🏆 Best Score</span>
          <span class="text-sm font-bold text-blue-600">${bestData ? `${bestData.score}pts · ${bestData.date}` : '-'}${isNewBest ? '<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>' : ''}</span>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-600 mb-2">📊 This Game Results</p>
          <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
            ${answerLog.map(l => `<div class="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${l.correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}"><span class="${l.correct ? 'text-green-700' : 'text-red-700'} font-semibold">${l.correct ? '✅' : '❌'} ${l.name}</span><span class="text-gray-400">${l.timeTaken}s</span></div>`).join('')}
          </div>
        </div>
        ${renderWeakStats()}
        <button id="share-result-btn" class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          Share Results
        </button>
      </div>
    `;
    document.getElementById('share-result-btn').onclick = () => {
        const text = `🏙️ Seoul District Quiz\nScore: ${roundedScore}/${total} · Accuracy ${accuracy}% · ${timeStr}\nHow well do you know Seoul? 👇\n${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => alert('Results copied to clipboard!'));
    };
    if (marker && map && map.hasLayer(marker)) marker.remove();
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
}

function saveLocationStats(name, isCorrect) {
    const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}');
    if (!stats[name]) stats[name] = { correct: 0, wrong: 0 };
    if (isCorrect) stats[name].correct++; else stats[name].wrong++;
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
}

function renderWeakStats() {
    const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}');
    const entries = Object.entries(stats).filter(([, v]) => v.wrong > 0).sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 5);
    if (entries.length === 0) return '';
    const bars = entries.map(([name, v]) => {
        const total = v.correct + v.wrong, pct = Math.round((v.wrong / total) * 100);
        return `<div><div class="flex justify-between text-xs text-gray-500 mb-0.5"><span class="font-semibold text-gray-700">${name}</span><span>${v.wrong} wrong / ${total} shown</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-red-400 h-2 rounded-full" style="width:${pct}%"></div></div></div>`;
    }).join('');
    return `<div><p class="text-sm font-bold text-gray-600 mb-2">📉 Most Missed Districts (All-time)</p><div class="space-y-2">${bars}</div></div>`;
}

function maskHint(hint, locationName) {
    const baseName = locationName.replace(/(구)$/, '');
    const mask = '〇'.repeat(baseName.length);
    const escaped = locationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const baseEscaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return hint.replace(new RegExp(escaped, 'g'), mask + locationName.slice(baseName.length)).replace(new RegExp(baseEscaped, 'g'), mask);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const distractors = shuffleArray(locations.map(l => l.name).filter(n => n !== correctAnswer));
    for (let i = 0; i < numOptions - 1; i++) options.push(distractors[i]);
    return shuffleArray(options);
}

level1Btn.addEventListener('click', () => selectDifficulty(1));
level2Btn.addEventListener('click', () => selectDifficulty(2));
restartBtn.addEventListener('click', showDifficultyScreen);
hintBtn.addEventListener('click', useHint);
document.getElementById('daily-btn')?.addEventListener('click', startDailyChallenge);

const toggleGuideBtn = document.getElementById('toggle-guide-btn');
const detailedGuide = document.getElementById('detailed-guide');
if (toggleGuideBtn && detailedGuide) {
    toggleGuideBtn.addEventListener('click', () => {
        const isHidden = detailedGuide.classList.contains('hidden');
        if (isHidden) { detailedGuide.classList.remove('hidden'); toggleGuideBtn.textContent = 'Close Guide'; }
        else { detailedGuide.classList.add('hidden'); toggleGuideBtn.textContent = 'Open Detailed Game Guide'; }
    });
}

nextQuestionBtn.addEventListener('click', () => {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    if (currentQuestionIndex < shuffledGameLocations.length - 1) { currentQuestionIndex++; loadQuestion(); } else endGame();
});