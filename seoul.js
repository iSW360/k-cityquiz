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

let map;
let marker;
let geoJsonLayer;
let autoNextTimer;
let countdownInterval;
let totalHintsUsed = 0;
let currentQuestionHintUsed = false;

// --- 타이머 관련 변수 ---
let questionTimer = null;
let questionTimeLeft = 0;
let questionTimeLimit = 10; // Level1: 미사용, Level2/챌린지: 15초

// --- 최고 점수 / 통계 / 소요 시간 ---
let gameStartTime = null;
let gameElapsedSec = 0;
let answerLog = [];
const LS_BEST  = 'kcityquiz_seoul_best';
const LS_STATS = 'kcityquiz_seoul_stats';

// --- 서울 구 데이터 ---
const locations = [
    { name: "종로구", lat: 37.5730, lng: 126.9794, zoom: 10, geoName: "종로구", hint: "경복궁과 청와대, 광화문 광장이 있는 서울의 역사 중심지" },
    { name: "중구",   lat: 37.5641, lng: 126.9979, zoom: 10, geoName: "중구",   hint: "남산타워와 명동, 동대문 디자인 플라자(DDP)가 있는 곳" },
    { name: "용산구", lat: 37.5326, lng: 126.9904, zoom: 10, geoName: "용산구", hint: "국립중앙박물관과 이태원, 용산공원이 위치한 곳" },
    { name: "성동구", lat: 37.5633, lng: 127.0371, zoom: 10, geoName: "성동구", hint: "서울숲과 수제화 거리로 유명한 성수동이 있는 곳" },
    { name: "광진구", lat: 37.5385, lng: 127.0824, zoom: 10, geoName: "광진구", hint: "어린이대공원과 뚝섬 한강공원, 건대입구가 유명함" },
    { name: "동대문구", lat: 37.5744, lng: 127.0400, zoom: 10, geoName: "동대문구", hint: "경동시장(한약재)과 시립대학교, 외대가 위치한 곳" },
    { name: "중랑구", lat: 37.6065, lng: 127.0927, zoom: 10, geoName: "중랑구", hint: "장미축제가 열리는 중랑천과 용마산이 유명한 곳" },
    { name: "성북구", lat: 37.5891, lng: 127.0182, zoom: 10, geoName: "성북구", hint: "북한산 자락 아래 대사관저와 고려대학교가 있는 곳" },
    { name: "강북구", lat: 37.6396, lng: 127.0257, zoom: 10, geoName: "강북구", hint: "북한산 국립공원의 입구와 '북서울 꿈의 숲'이 있는 곳" },
    { name: "도봉구", lat: 37.6688, lng: 127.0471, zoom: 10, geoName: "도봉구", hint: "도봉산과 둘리뮤지엄이 있는 서울 북단의 구" },
    { name: "노원구", lat: 37.6542, lng: 127.0568, zoom: 10, geoName: "노원구", hint: "불암산과 수락산, 그리고 교육열이 높은 중계동 학원가" },
    { name: "은평구", lat: 37.6027, lng: 126.9291, zoom: 10, geoName: "은평구", hint: "진관사와 북한산 한옥마을이 조성된 쾌적한 주거지" },
    { name: "서대문구", lat: 37.5791, lng: 126.9368, zoom: 10, geoName: "서대문구", hint: "독립문과 서대문형무소 역사관, 연세대학교가 있는 곳" },
    { name: "마포구", lat: 37.5662, lng: 126.9016, zoom: 10, geoName: "마포구", hint: "홍대 거리와 망원동, 상암 월드컵경기장이 유명함" },
    { name: "양천구", lat: 37.5169, lng: 126.8665, zoom: 10, geoName: "양천구", hint: "목동 신시가지와 SBS 방송국이 위치한 교육 중심지" },
    { name: "강서구", lat: 37.5509, lng: 126.8495, zoom: 10, geoName: "강서구", hint: "김포공항과 마곡지구(서울식물원)가 있는 서울 서부 관문" },
    { name: "구로구", lat: 37.4954, lng: 126.8875, zoom: 10, geoName: "구로구", hint: "과거 공단에서 IT 벤처 중심지(디지털단지)로 탈바꿈한 곳" },
    { name: "금천구", lat: 37.4568, lng: 126.8952, zoom: 10, geoName: "금천구", hint: "가산디지털단지와 아울렛 쇼핑몰이 밀집한 남서부의 구" },
    { name: "영등포구", lat: 37.5264, lng: 126.8962, zoom: 10, geoName: "영등포구", hint: "여의도 국회의사당과 금융가, 63빌딩이 있는 곳" },
    { name: "동작구", lat: 37.5124, lng: 126.9395, zoom: 10, geoName: "동작구", hint: "국립서울현충원과 노량진 수산시장이 매우 유명함" },
    { name: "관악구", lat: 37.4784, lng: 126.9515, zoom: 10, geoName: "관악구", hint: "서울대학교와 관악산 등산로가 있는 남부의 구" },
    { name: "서초구", lat: 37.4837, lng: 127.0324, zoom: 10, geoName: "서초구", hint: "예술의전당과 대법원, 강남터미널이 위치한 곳" },
    { name: "강남구", lat: 37.4959, lng: 127.0664, zoom: 10, geoName: "강남구", hint: "코엑스와 가로수길, 압구정 로데오 거리가 있는 트렌드 중심지" },
    { name: "송파구", lat: 37.5145, lng: 127.1061, zoom: 10, geoName: "송파구", hint: "롯데월드타워와 석촌호수, 올림픽공원이 있는 관광 명소" },
    { name: "강동구", lat: 37.5301, lng: 127.1238, zoom: 10, geoName: "강동구", hint: "암사동 선사유적지와 허브천문공원이 있는 주거 지역" }
];

let shuffledGameLocations = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswerName = '';
let numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const PROVINCE_VIEW_ZOOM = 9;
const CITY_VIEW_DELAY = 1000;

function getColorForRegion(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    const hue = (hash * 13) % 360;
    const lightness = 45 + (hash % 20);
    return `hsl(${hue}, 65%, ${lightness}%)`;
}

// =============================================
// 타이머 UI
// =============================================
function createTimerUI() {
    const existing = document.getElementById('question-timer');
    if (existing) existing.remove();

    const timerEl = document.createElement('div');
    timerEl.id = 'question-timer';
    timerEl.className = 'flex items-center justify-center gap-2 mb-3';
    timerEl.innerHTML = `
        <div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-indigo-500" style="width:100%"></div>
        </div>
        <span id="timer-text" class="text-sm font-bold text-indigo-600 min-w-[2.5rem] text-right">${questionTimeLimit}초</span>
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
        if (timerText) timerText.textContent = questionTimeLeft + '초';

        if (timerBar) {
            if (questionTimeLeft <= 3) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500';
                if (timerText) timerText.className = 'text-sm font-bold text-red-600 min-w-[2.5rem] text-right';
            } else if (questionTimeLeft <= 6) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-amber-500';
                if (timerText) timerText.className = 'text-sm font-bold text-amber-600 min-w-[2.5rem] text-right';
            }
        }

        if (questionTimeLeft <= 0) {
            clearInterval(questionTimer);
            handleTimeOut();
        }
    }, 1000);
}

function stopQuestionTimer() {
    if (questionTimer) {
        clearInterval(questionTimer);
        questionTimer = null;
    }
}

function handleTimeOut() {
    stopQuestionTimer();
    answerLog.push({ name: correctAnswerName, correct: false, timeTaken: questionTimeLimit });
    saveLocationStats(correctAnswerName, false);

    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
        if (btn.textContent === correctAnswerName) {
            btn.classList.remove('bg-white', 'text-blue-700', 'border-blue-300', 'opacity-70');
            btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
        }
    });

    feedbackTextElement.innerHTML = `<span class="text-orange-600 font-bold">⏰ 시간 초과! 정답은 <strong>${correctAnswerName}</strong> 입니다.</span>`;

    const btnLabel = (currentQuestionIndex < shuffledGameLocations.length - 1) ? '다음 문제' : '결과 보기';
    nextQuestionBtn.textContent = `${btnLabel} (3초)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';

    let countdown = 3;
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = `${btnLabel} (${countdown}초)`;
        else clearInterval(countdownInterval);
    }, 1000);

    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            endGame();
        }
    }, 3000);
}

// =============================================

async function initMap() {
    mapErrorInfo.textContent = '지도 데이터 로딩 중...';
    if (map) map.remove();
    map = L.map('map', { zoomControl: false }).setView([37.5665, 126.9780], 10);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    const geoJsonUrl = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json';
    try {
        const response = await fetch(geoJsonUrl);
        const data = await response.json();
        const seoulData = {
            type: "FeatureCollection",
            features: data.features.filter(f => f.properties.code && f.properties.code.startsWith('11'))
        };
        if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
        geoJsonLayer = L.geoJSON(seoulData, {
            style: function (feature) {
                const color = getColorForRegion(feature.properties.name || '');
                return { color, weight: 1.5, opacity: 0.8, fillOpacity: 0.3, fillColor: color };
            },
            onEachFeature: function (feature, layer) {
                layer.on({
                    mouseover: e => e.target.setStyle({ weight: 3, fillOpacity: 0.5 }),
                    mouseout:  e => geoJsonLayer && geoJsonLayer.resetStyle(e.target)
                });
            }
        }).addTo(map);
        mapErrorInfo.textContent = '';
    } catch (error) {
        mapErrorInfo.textContent = '행정구역 데이터 로딩 실패.';
    }

    marker = L.marker([0, 0], {
        icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41], iconAnchor: [12, 41]
        })
    });
}

function highlightCurrentQuestionRegion(questionGeoName) {
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(function (layer) {
            const featureName = layer.feature.properties.name || '';
            if (featureName === questionGeoName) {
                layer.setStyle({ weight: 4, color: '#c00', fillOpacity: 0.6, fillColor: '#ffeb3b' });
                layer.bringToFront();
            } else {
                geoJsonLayer.resetStyle(layer);
            }
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
}

async function startGame() {
    score = 0;
    currentQuestionIndex = 0;
    totalHintsUsed = 0;
    currentQuestionHintUsed = false;
    hintsRemainingElement.textContent = totalHintsUsed;
    gameStartTime = Date.now();
    gameElapsedSec = 0;
    answerLog = [];

    shuffledGameLocations = shuffleArray([...locations]).slice(0, MAX_QUESTIONS_PER_GAME);
    totalQuestionsElement.textContent = shuffledGameLocations.length;
    progressArea.style.display = 'block';

    if (!map) {
        await initMap();
    } else {
        if (marker && map.hasLayer(marker)) marker.remove();
        if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    }

    restartBtn.textContent = '처음으로';
    hintBtn.style.display = 'inline-flex';
    hintBtn.disabled = false;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= shuffledGameLocations.length) {
        endGame();
        return;
    }

    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    const currentLocation = shuffledGameLocations[currentQuestionIndex];
    correctAnswerName = currentLocation.name;
    currentQuestionHintUsed = false;
    questionTimeLeft = questionTimeLimit;

    questionTextElement.textContent = "어느 구일까요?";
    currentQuestionElement.textContent = currentQuestionIndex + 1;

    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    highlightCurrentQuestionRegion(currentLocation.geoName);

    const latLng = [currentLocation.lat, currentLocation.lng];
    if (marker) marker.setLatLng(latLng).addTo(map);
    map.setView([37.5665, 126.9780], PROVINCE_VIEW_ZOOM);

    setTimeout(() => {
        if (map) map.flyTo(latLng, currentLocation.zoom || 10, { duration: 1 });
    }, CITY_VIEW_DELAY);

    optionsArea.innerHTML = '';
    const options = generateOptions(correctAnswerName);
    options.forEach(optionName => {
        const button = document.createElement('button');
        button.textContent = optionName;
        button.className = "option-button w-full bg-white hover:bg-blue-100 text-blue-700 font-semibold border border-blue-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none";
        button.onclick = () => handleAnswer(optionName, button);
        optionsArea.appendChild(button);
    });

    feedbackTextElement.textContent = '';
    nextQuestionBtn.style.display = 'none';

    if (isKidsMode) {
        hintBtn.style.display = 'none';
        setTimeout(() => {
            feedbackTextElement.textContent = `💡 힌트: ${maskHint(currentLocation.hint, correctAnswerName)}`;
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

    const currentLocation = shuffledGameLocations[currentQuestionIndex];
    const isCorrect = selectedName === correctAnswerName;
    const timeTaken = questionTimeLimit - questionTimeLeft;

    answerLog.push({ name: correctAnswerName, correct: isCorrect, timeTaken });
    saveLocationStats(correctAnswerName, isCorrect);

    const timeBonus = questionTimeLeft > 0 ? (questionTimeLeft / questionTimeLimit) : 0;

    if (isCorrect) {
        let gainedScore;
        if (currentQuestionHintUsed) {
            gainedScore = 0.5;
        } else {
            gainedScore = Math.round((0.5 + timeBonus * 0.5) * 10) / 10;
        }
        score += gainedScore;
        const timeMsg = currentQuestionHintUsed ? '' : ' ⚡ 빠른 정답 보너스!';
        feedbackTextElement.innerHTML = `<span class="text-green-600 font-bold">정답입니다! 👏 (+${gainedScore}점)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(currentLocation.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        feedbackTextElement.innerHTML = `<span class="text-red-600 font-bold">오답입니다. 정답은 ${correctAnswerName} 입니다. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(currentLocation.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-700');
        Array.from(optionsArea.children).forEach(btn => {
            if (btn.textContent === correctAnswerName) {
                btn.classList.remove('opacity-70');
                btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
            }
        });
    }

    let countdown = 4;
    const btnLabel = (currentQuestionIndex < shuffledGameLocations.length - 1) ? '다음 문제' : '결과 보기';
    nextQuestionBtn.textContent = `${btnLabel} (${countdown}초)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';

    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = `${btnLabel} (${countdown}초)`;
        else clearInterval(countdownInterval);
    }, 1000);

    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            endGame();
        }
    }, 4000);
}

function useHint() {
    if (!currentQuestionHintUsed) {
        totalHintsUsed++;
        currentQuestionHintUsed = true;
        hintsRemainingElement.textContent = totalHintsUsed;
    }
    const currentLocation = shuffledGameLocations[currentQuestionIndex];
    feedbackTextElement.textContent = `💡 힌트: ${maskHint(currentLocation.hint, correctAnswerName)}`;
    feedbackTextElement.className = 'text-md font-medium text-amber-600';
}

function endGame() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();

    gameElapsedSec = Math.round((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(gameElapsedSec / 60);
    const secs = gameElapsedSec % 60;
    const timeStr = mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;

    const roundedScore = Math.round(score * 10) / 10;
    const total = shuffledGameLocations.length;
    const correctCount = answerLog.filter(l => l.correct).length;
    const accuracy = Math.round((correctCount / total) * 100);
    const avgTime = answerLog.length
        ? Math.round(answerLog.reduce((s, l) => s + l.timeTaken, 0) / answerLog.length)
        : 0;

    // 최고 점수 처리
    const prev = JSON.parse(localStorage.getItem(LS_BEST) || 'null');
    const isNewBest = !prev || roundedScore > prev.score
        || (roundedScore === prev.score && gameElapsedSec < prev.elapsed);
    if (isNewBest) {
        localStorage.setItem(LS_BEST, JSON.stringify({
            score: roundedScore, elapsed: gameElapsedSec,
            date: new Date().toLocaleDateString('ko-KR')
        }));
    }
    const bestData = JSON.parse(localStorage.getItem(LS_BEST));

    questionTextElement.textContent = `게임 종료! 최종 점수: ${roundedScore} / ${total}`;
    progressArea.style.display = 'none';
    hintBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    restartBtn.textContent = '처음으로';

    optionsArea.innerHTML = `
      <div class="col-span-4 space-y-4">

        <!-- 요약 카드 -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p class="text-xs text-blue-400 font-semibold mb-1">최종 점수</p>
            <p class="text-2xl font-extrabold text-blue-600">${roundedScore}<span class="text-sm font-normal text-blue-400">/${total}</span></p>
          </div>
          <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <p class="text-xs text-emerald-400 font-semibold mb-1">정답률</p>
            <p class="text-2xl font-extrabold text-emerald-600">${accuracy}<span class="text-sm font-normal text-emerald-400">%</span></p>
          </div>
          <div class="bg-amber-50 rounded-xl p-3 border border-amber-100">
            <p class="text-xs text-amber-400 font-semibold mb-1">소요 시간</p>
            <p class="text-lg font-extrabold text-amber-600">${timeStr}</p>
            <p class="text-xs text-amber-400">평균 ${avgTime}초/문제</p>
          </div>
        </div>

        <!-- 최고 점수 -->
        <div class="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 py-3 border border-blue-100">
          <span class="text-sm font-bold text-blue-700">🏆 역대 최고 점수</span>
          <span class="text-sm font-bold text-blue-600">
            ${bestData ? `${bestData.score}점 · ${bestData.date}` : '-'}
            ${isNewBest ? '<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>' : ''}
          </span>
        </div>

        <!-- 이번 게임 정오답 -->
        <div>
          <p class="text-sm font-bold text-gray-600 mb-2">📊 이번 게임 정오답</p>
          <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
            ${answerLog.map(l => `
              <div class="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${l.correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}">
                <span class="${l.correct ? 'text-green-700' : 'text-red-700'} font-semibold">
                  ${l.correct ? '✅' : '❌'} ${l.name}
                </span>
                <span class="text-gray-400">${l.timeTaken}초</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 자주 틀리는 구 통계 -->
        ${renderWeakStats()}

        <!-- 공유 버튼 -->
        <button id="share-result-btn"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          결과 공유하기
        </button>
      </div>
    `;

    document.getElementById('share-result-btn').onclick = () => {
        const text = `📍 서울 구 퀴즈\n점수: ${roundedScore}/${total} · 정답률 ${accuracy}% · ${timeStr}\n서울을 얼마나 아시나요? 👇\n${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => alert('결과가 클립보드에 복사되었습니다!'));
    };

    if (marker && map && map.hasLayer(marker)) marker.remove();
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
}

// =============================================
// localStorage 통계
// =============================================
function saveLocationStats(name, isCorrect) {
    const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}');
    if (!stats[name]) stats[name] = { correct: 0, wrong: 0 };
    if (isCorrect) stats[name].correct++;
    else stats[name].wrong++;
    localStorage.setItem(LS_STATS, JSON.stringify(stats));
}

function renderWeakStats() {
    const stats = JSON.parse(localStorage.getItem(LS_STATS) || '{}');
    const entries = Object.entries(stats)
        .filter(([, v]) => v.wrong > 0)
        .sort((a, b) => b[1].wrong - a[1].wrong)
        .slice(0, 5);

    if (entries.length === 0) return '';

    const bars = entries.map(([name, v]) => {
        const total = v.correct + v.wrong;
        const wrongPct = Math.round((v.wrong / total) * 100);
        return `
          <div>
            <div class="flex justify-between text-xs text-gray-500 mb-0.5">
              <span class="font-semibold text-gray-700">${name}</span>
              <span>${v.wrong}번 틀림 / ${total}번 출제</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2">
              <div class="bg-red-400 h-2 rounded-full" style="width:${wrongPct}%"></div>
            </div>
          </div>
        `;
    }).join('');

    return `
      <div>
        <p class="text-sm font-bold text-gray-600 mb-2">📉 자주 틀리는 구 (누적)</p>
        <div class="space-y-2">${bars}</div>
      </div>
    `;
}

// =============================================

// =============================================
// 힌트에서 정답 지역명 자동 마스킹
// =============================================
function maskHint(hint, locationName) {
    const baseName = locationName.replace(/(특별시|광역시|특별자치시|특별자치도|시|군|구|동|읍|면)$/, '');
    const mask = '〇'.repeat(baseName.length);
    const escaped = locationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const baseEscaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return hint
        .replace(new RegExp(escaped, 'g'), mask + locationName.slice(baseName.length))
        .replace(new RegExp(baseEscaped, 'g'), mask);
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
    const distractors = locations.map(l => l.name).filter(n => n !== correctAnswer);
    shuffleArray(distractors);
    for (let i = 0; i < numOptions - 1; i++) options.push(distractors[i]);
    return shuffleArray(options);
}

// --- Event Listeners ---
level1Btn.addEventListener('click', () => selectDifficulty(1));
level2Btn.addEventListener('click', () => selectDifficulty(2));
restartBtn.addEventListener('click', showDifficultyScreen);
hintBtn.addEventListener('click', useHint);

const toggleGuideBtn = document.getElementById('toggle-guide-btn');
const detailedGuide = document.getElementById('detailed-guide');
if (toggleGuideBtn && detailedGuide) {
    toggleGuideBtn.addEventListener('click', () => {
        const isHidden = detailedGuide.classList.contains('hidden');
        if (isHidden) {
            detailedGuide.classList.remove('hidden');
            toggleGuideBtn.textContent = '게임 상세 소개 닫기';
        } else {
            detailedGuide.classList.add('hidden');
            toggleGuideBtn.textContent = '게임 상세 소개 보기';
        }
    });
}

nextQuestionBtn.addEventListener('click', () => {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    if (currentQuestionIndex < shuffledGameLocations.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
    } else {
        endGame();
    }
});