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

// --- 타이머 ---
let questionTimer = null, questionTimeLeft = 0;
let questionTimeLimit = 10;

// --- 점수 / 통계 / 시간 ---
let gameStartTime = null, gameElapsedSec = 0, answerLog = [];
const LS_BEST  = 'kcityquiz_us_best';
const LS_STATS = 'kcityquiz_us_stats';
const LS_DAILY = 'kcityquiz_us_daily';
let isDailyMode = false;

// --- 미국 50개 주 데이터 (한국어 힌트) ---
const locations = [
    { name: "앨라배마", en: "Alabama",      lat: 32.806671, lng: -86.791130, zoom: 5,  geoName: "Alabama",       hint: "로켓 도시 헌츠빌과 남북전쟁 역사의 중심지" },
    { name: "알래스카",  en: "Alaska",       lat: 64.200841, lng: -153.406550,zoom: 3,  geoName: "Alaska",        hint: "미국 최대 주로 오로라와 빙하, 야생동물의 천국" },
    { name: "애리조나",  en: "Arizona",      lat: 34.048928, lng: -111.093731,zoom: 5,  geoName: "Arizona",       hint: "그랜드 캐니언과 사막 지형, 선인장이 유명함" },
    { name: "아칸소",    en: "Arkansas",     lat: 34.799999, lng: -92.199999, zoom: 5,  geoName: "Arkansas",      hint: "빌 클린턴 대통령의 고향이며 핫스프링스로 유명함" },
    { name: "캘리포니아",en: "California",   lat: 36.778259, lng: -119.417931,zoom: 4,  geoName: "California",    hint: "할리우드, 실리콘밸리, 골든게이트 브리지가 있는 곳" },
    { name: "콜로라도",  en: "Colorado",     lat: 39.550051, lng: -105.782067,zoom: 5,  geoName: "Colorado",      hint: "로키산맥과 스키 리조트, 콜로라도 스프링스가 유명함" },
    { name: "코네티컷",  en: "Connecticut",  lat: 41.603221, lng: -73.087749, zoom: 6,  geoName: "Connecticut",   hint: "미국에서 가장 작은 주 중 하나이며 예일대학교가 있음" },
    { name: "델라웨어",  en: "Delaware",     lat: 38.910832, lng: -75.527670, zoom: 6,  geoName: "Delaware",      hint: "미국 최초로 연방헌법을 비준한 '첫 번째 주'" },
    { name: "플로리다",  en: "Florida",      lat: 27.994402, lng: -81.760254, zoom: 5,  geoName: "Florida",       hint: "디즈니월드, 마이애미 해변, 케네디 우주센터의 주" },
    { name: "조지아",    en: "Georgia",      lat: 32.165622, lng: -82.900075, zoom: 5,  geoName: "Georgia",       hint: "코카콜라 본사와 복숭아, 마틴 루터 킹 목사의 고향" },
    { name: "하와이",    en: "Hawaii",       lat: 19.896766, lng: -155.582782,zoom: 5,  geoName: "Hawaii",        hint: "태평양의 화산 제도로 서핑과 훌라 댄스의 고향" },
    { name: "아이다호",  en: "Idaho",        lat: 44.068202, lng: -114.742041,zoom: 5,  geoName: "Idaho",         hint: "세계 최고의 감자 생산지로 크레이터 오브 더 문이 유명함" },
    { name: "일리노이",  en: "Illinois",     lat: 40.000000, lng: -89.000000, zoom: 5,  geoName: "Illinois",      hint: "시카고 딥 디쉬 피자와 시어스 타워(윌리스 타워)의 주" },
    { name: "인디애나",  en: "Indiana",      lat: 40.273502, lng: -86.126976, zoom: 5,  geoName: "Indiana",       hint: "인디애나폴리스 500 자동차 경주로 세계적으로 유명함" },
    { name: "아이오와",  en: "Iowa",         lat: 41.878003, lng: -93.097702, zoom: 5,  geoName: "Iowa",          hint: "미국 최대의 옥수수와 대두 생산지이며 아이오와 코커스로 유명" },
    { name: "캔자스",    en: "Kansas",       lat: 38.500000, lng: -98.000000, zoom: 5,  geoName: "Kansas",        hint: "미국의 지리적 중심부이며 광활한 밀밭의 '밀의 주'" },
    { name: "켄터키",    en: "Kentucky",     lat: 37.839333, lng: -84.270018, zoom: 5,  geoName: "Kentucky",      hint: "켄터키 프라이드 치킨 발상지이며 버번 위스키와 경마로 유명" },
    { name: "루이지애나",en: "Louisiana",    lat: 30.984298, lng: -91.962333, zoom: 5,  geoName: "Louisiana",     hint: "뉴올리언스 재즈와 마디그라 축제, 케이준 요리의 고장" },
    { name: "메인",      en: "Maine",        lat: 45.253783, lng: -69.445469, zoom: 5,  geoName: "Maine",         hint: "미국 최동북단으로 랍스터와 블루베리가 전국적으로 유명함" },
    { name: "메릴랜드",  en: "Maryland",     lat: 39.045755, lng: -76.641271, zoom: 6,  geoName: "Maryland",      hint: "체서피크 만의 블루크랩과 워싱턴 D.C.를 둘러싼 주" },
    { name: "매사추세츠",en: "Massachusetts",lat: 42.407211, lng: -71.382437, zoom: 6,  geoName: "Massachusetts", hint: "하버드·MIT가 있으며 보스턴 마라톤과 메이플라워의 역사" },
    { name: "미시간",    en: "Michigan",     lat: 44.314844, lng: -85.602364, zoom: 5,  geoName: "Michigan",      hint: "디트로이트 자동차 산업과 5대호, 모타운 음악의 발상지" },
    { name: "미네소타",  en: "Minnesota",    lat: 46.729553, lng: -94.685900, zoom: 5,  geoName: "Minnesota",     hint: "'만 개의 호수의 주'로 메이요 클리닉과 프린스의 고향" },
    { name: "미시시피",  en: "Mississippi",  lat: 32.354668, lng: -89.398528, zoom: 5,  geoName: "Mississippi",   hint: "블루스 음악의 발상지이며 미시시피 강 유역의 풍요로운 주" },
    { name: "미주리",    en: "Missouri",     lat: 37.964253, lng: -91.831833, zoom: 5,  geoName: "Missouri",      hint: "세인트루이스 아치(게이트웨이 아치)와 캔자스시티 바비큐" },
    { name: "몬태나",    en: "Montana",      lat: 46.879682, lng: -110.362566,zoom: 4,  geoName: "Montana",       hint: "글레이셔 국립공원과 옐로스톤, '빅 스카이 컨트리'" },
    { name: "네브래스카",en: "Nebraska",     lat: 41.492537, lng: -99.901810, zoom: 5,  geoName: "Nebraska",      hint: "워런 버핏의 고향 오마하와 광활한 대평원이 있는 주" },
    { name: "네바다",    en: "Nevada",       lat: 38.802610, lng: -116.419389,zoom: 5,  geoName: "Nevada",        hint: "라스베이거스 카지노와 후버댐, 사막 지형의 오락의 주" },
    { name: "뉴햄프셔",  en: "New Hampshire",lat: 43.193852, lng: -71.572395, zoom: 6,  geoName: "New Hampshire", hint: "'자유롭게 살거나 죽거나' 슬로건과 단풍 명소로 유명함" },
    { name: "뉴저지",    en: "New Jersey",   lat: 40.058324, lng: -74.405661, zoom: 6,  geoName: "New Jersey",    hint: "에디슨의 발명 연구소가 있으며 뉴욕과 인접한 주" },
    { name: "뉴멕시코",  en: "New Mexico",   lat: 34.519940, lng: -105.870090,zoom: 5,  geoName: "New Mexico",    hint: "로스웰 UFO 전설과 화이트샌즈, 핵 연구소로 유명함" },
    { name: "뉴욕",      en: "New York",     lat: 42.165726, lng: -74.948051, zoom: 5,  geoName: "New York",      hint: "자유의 여신상, 타임스스퀘어, 월스트리트가 있는 세계 도시" },
    { name: "노스캐롤라이나", en: "North Carolina", lat: 35.630066, lng: -79.806419, zoom: 5,  geoName: "North Carolina", hint: "라이트 형제의 첫 비행지이며 리서치 트라이앵글로 유명함" },
    { name: "노스다코타", en: "North Dakota", lat: 47.528912, lng: -99.784012, zoom: 5,  geoName: "North Dakota",  hint: "미국 최북단 주 중 하나로 해바라기와 밀 생산의 중심지" },
    { name: "오하이오",  en: "Ohio",         lat: 40.417287, lng: -82.907123, zoom: 5,  geoName: "Ohio",          hint: "항공우주 산업의 메카이며 닐 암스트롱과 존 글렌의 고향" },
    { name: "오클라호마",en: "Oklahoma",     lat: 35.007752, lng: -97.092877, zoom: 5,  geoName: "Oklahoma",      hint: "오클라호마 시티 폭탄 테러와 석유 산업, 체로키족 역사" },
    { name: "오리건",    en: "Oregon",       lat: 43.804133, lng: -120.554201,zoom: 5,  geoName: "Oregon",        hint: "포틀랜드 커피 문화와 크레이터 레이크 국립공원이 유명함" },
    { name: "펜실베이니아", en: "Pennsylvania", lat: 41.203322, lng: -77.194525, zoom: 5,  geoName: "Pennsylvania", hint: "독립선언서가 서명된 필라델피아와 피츠버그 철강 산업" },
    { name: "로드아일랜드", en: "Rhode Island", lat: 41.700001, lng: -71.500000, zoom: 7,  geoName: "Rhode Island", hint: "미국에서 가장 작은 주이며 뉴포트 요트 경기로 유명함" },
    { name: "사우스캐롤라이나", en: "South Carolina", lat: 33.836081, lng: -81.163725, zoom: 5,  geoName: "South Carolina", hint: "미국 남북전쟁의 첫 총성이 울린 섬터 요새가 있는 주" },
    { name: "사우스다코타", en: "South Dakota", lat: 43.969515, lng: -99.901810, zoom: 5,  geoName: "South Dakota", hint: "러시모어 산의 대통령 조각상과 배드랜즈 국립공원" },
    { name: "테네시",    en: "Tennessee",    lat: 35.517491, lng: -86.580447, zoom: 5,  geoName: "Tennessee",     hint: "컨트리 뮤직의 수도 내슈빌과 엘비스의 멤피스" },
    { name: "텍사스",    en: "Texas",        lat: 31.000000, lng: -100.000000,zoom: 4,  geoName: "Texas",         hint: "미국 2위 최대 주로 NASA 존슨 우주센터와 텍사스 바비큐" },
    { name: "유타",      en: "Utah",         lat: 39.320980, lng: -111.093731,zoom: 5,  geoName: "Utah",          hint: "아치스·자이언·브라이스캐니언 등 5개 국립공원의 주" },
    { name: "버몬트",    en: "Vermont",      lat: 44.045876, lng: -72.710686, zoom: 6,  geoName: "Vermont",       hint: "메이플 시럽과 스키, 가을 단풍이 아름다운 뉴잉글랜드 주" },
    { name: "버지니아",  en: "Virginia",     lat: 37.431573, lng: -78.656894, zoom: 5,  geoName: "Virginia",      hint: "미국 최초 영구 정착지 제임스타운과 조지 워싱턴의 고향" },
    { name: "워싱턴",    en: "Washington",   lat: 47.751074, lng: -120.740139,zoom: 5,  geoName: "Washington",    hint: "시애틀 스페이스 니들과 마이크로소프트·아마존 본사" },
    { name: "웨스트버지니아", en: "West Virginia", lat: 38.597626, lng: -80.454903, zoom: 5,  geoName: "West Virginia", hint: "남북전쟁 당시 버지니아에서 분리된 주로 탄광 산업의 역사" },
    { name: "위스콘신",  en: "Wisconsin",    lat: 43.784440, lng: -88.787868, zoom: 5,  geoName: "Wisconsin",     hint: "미국 최대 치즈 생산지로 '치즈헤드'라 불리는 주" },
    { name: "와이오밍",  en: "Wyoming",      lat: 43.075968, lng: -107.290284,zoom: 5,  geoName: "Wyoming",       hint: "세계 최초 국립공원 옐로스톤과 그랜드 티턴이 있는 주" },
];

let shuffledGameLocations = [], currentQuestionIndex = 0, score = 0;
let correctAnswerName = '', numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const CITY_VIEW_DELAY = 1500;

// =============================================
// 일일 챌린지
// =============================================
function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getDailyLocations() {
    const seed = parseInt(getTodayKey().replace(/-/g,''), 10);
    const arr = [...locations]; let s = seed;
    function rand() {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s>>>15, 1|s);
        t = t + Math.imul(t ^ t>>>7, 61|t) ^ t;
        return ((t ^ t>>>14)>>>0) / 4294967296;
    }
    for (let i=arr.length-1;i>0;i--) { const j=Math.floor(rand()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
    return arr.slice(0, MAX_QUESTIONS_PER_GAME);
}
function getDailyStatus() {
    const s = JSON.parse(localStorage.getItem(LS_DAILY)||'null');
    return (s && s.date===getTodayKey()) ? s : null;
}
function saveDailyResult(score, elapsed) {
    localStorage.setItem(LS_DAILY, JSON.stringify({date:getTodayKey(), score, elapsed}));
}
let isKidsMode = false;

function startDailyChallenge() {
    const status = getDailyStatus();
    if (status) { alert(`오늘의 챌린지는 이미 완료했어요! 🎉\n점수: ${status.score} / ${MAX_QUESTIONS_PER_GAME}\n내일 다시 도전하세요!`); return; }
    isDailyMode = true; isKidsMode = false;
    numOptions = 8; questionTimeLimit = 15;
    difficultySelector.style.display = 'none';
    quizContainer.style.display = 'block';
    startGame(true);
}

// =============================================
// 타이머
// =============================================
function createTimerUI() {
    const e = document.getElementById('question-timer'); if (e) e.remove();
    const el = document.createElement('div');
    el.id = 'question-timer'; el.className = 'flex items-center justify-center gap-2 mb-3';
    el.innerHTML = `<div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden"><div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500" style="width:100%"></div></div><span id="timer-text" class="text-sm font-bold text-red-600 min-w-[2.5rem] text-right">${questionTimeLimit}초</span>`;
    const qa = document.getElementById('question-area');
    qa.parentNode.insertBefore(el, qa);
}
function startQuestionTimer() {
    if (questionTimer) clearInterval(questionTimer);
    questionTimeLeft = questionTimeLimit; createTimerUI();
    const bar = document.getElementById('timer-bar'), txt = document.getElementById('timer-text');
    questionTimer = setInterval(() => {
        questionTimeLeft--;
        const pct = (questionTimeLeft/questionTimeLimit)*100;
        if (bar) bar.style.width = pct+'%';
        if (txt) txt.textContent = questionTimeLeft+'초';
        if (bar) {
            if (questionTimeLeft<=3) { bar.className='h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500'; if(txt) txt.className='text-sm font-bold text-red-600 min-w-[2.5rem] text-right'; }
            else if (questionTimeLeft<=6) { bar.className='h-3 rounded-full transition-all duration-1000 ease-linear bg-amber-500'; if(txt) txt.className='text-sm font-bold text-amber-600 min-w-[2.5rem] text-right'; }
        }
        if (questionTimeLeft<=0) { clearInterval(questionTimer); handleTimeOut(); }
    }, 1000);
}
function stopQuestionTimer() { if (questionTimer) { clearInterval(questionTimer); questionTimer=null; } }

function handleTimeOut() {
    stopQuestionTimer();
    answerLog.push({name:correctAnswerName, correct:false, timeTaken:questionTimeLimit});
    saveLocationStats(correctAnswerName, false);
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled=true; btn.classList.add('opacity-70','cursor-not-allowed');
        if (btn.textContent===correctAnswerName) { btn.classList.remove('bg-white','text-red-700','border-red-300','opacity-70'); btn.classList.add('bg-green-500','text-white','border-green-700'); }
    });
    feedbackTextElement.innerHTML = `<span class="text-orange-600 font-bold">⏰ 시간 초과! 정답은 <strong>${correctAnswerName}</strong> 입니다.</span>`;
    const btnLabel = (currentQuestionIndex<shuffledGameLocations.length-1)?'다음 문제':'결과 보기';
    nextQuestionBtn.textContent=`${btnLabel} (3초)`; nextQuestionBtn.style.display='inline-block'; hintBtn.style.display='none';
    let cd=3;
    countdownInterval=setInterval(()=>{ cd--; if(cd>0) nextQuestionBtn.textContent=`${btnLabel} (${cd}초)`; else clearInterval(countdownInterval); },1000);
    autoNextTimer=setTimeout(()=>{ if(currentQuestionIndex<shuffledGameLocations.length-1) moveToNextQuestion(); else endGame(); },3000);
}

// =============================================
// 지도 초기화 (미국 GeoJSON)
// =============================================
async function initMap() {
    mapErrorInfo.textContent = '지도 데이터 로딩 중...';
    if (map) map.remove();
    // 미국 본토 중심으로 초기 뷰
    map = L.map('map').setView([38.5, -96], 4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    // Natural Earth 미국 주 GeoJSON
    const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
    try {
        const res = await fetch(geoUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const topo = await res.json();
        // TopoJSON → GeoJSON 변환 (topojson-client CDN 필요)
        // 대신 직접 GeoJSON 소스 사용
        throw new Error('use geojson');
    } catch(e) {
        // 백업: 직접 GeoJSON 소스
        try {
            const res2 = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
            if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
            const data = await res2.json();
            if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
            geoJsonLayer = L.geoJSON(data, {
                style: f => {
                    const name = f.properties.name || '';
                    const hue = (name.charCodeAt(0)*7 + name.charCodeAt(1||0)*13) % 360;
                    return { color:`hsl(${hue},55%,48%)`, weight:1.5, opacity:0.8, fillOpacity:0.25, fillColor:`hsl(${hue},55%,58%)` };
                },
                onEachFeature: (f, layer) => {
                    layer.on({
                        mouseover: e => { e.target.setStyle({weight:3,fillOpacity:0.45}); if(!L.Browser.ie&&!L.Browser.opera&&!L.Browser.edge) e.target.bringToFront(); },
                        mouseout:  e => geoJsonLayer && geoJsonLayer.resetStyle(e.target)
                    });
                }
            }).addTo(map);
            mapErrorInfo.textContent = '';
        } catch(e2) {
            mapErrorInfo.textContent = '주 경계선 데이터 로딩에 실패했습니다.';
        }
    }
    marker = L.marker([0,0], { icon: L.icon({
        iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize:[25,41], iconAnchor:[12,41], popupAnchor:[1,-34],
        shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', shadowSize:[41,41]
    })});
}

function highlightState(stateName) {
    if (!geoJsonLayer) return;
    geoJsonLayer.eachLayer(layer => {
        const fn = layer.feature.properties.name || '';
        if (fn === stateName) {
            layer.setStyle({weight:4, color:'#c00', fillOpacity:0.65, fillColor:'#ffeb3b'});
            if (!L.Browser.ie&&!L.Browser.opera&&!L.Browser.edge) layer.bringToFront();
        } else { geoJsonLayer.resetStyle(layer); }
    });
}

function selectDifficulty(level) {
    isDailyMode=false; isKidsMode=(level===1);
    numOptions=(level===2)?8:4;
    questionTimeLimit=(level===2)?15:10;
    difficultySelector.style.display='none'; quizContainer.style.display='block'; startGame();
}

function showDifficultyScreen() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const te=document.getElementById('question-timer'); if(te) te.remove();
    quizContainer.style.display='none'; difficultySelector.style.display='block';
    questionTextElement.textContent='게임 시작 버튼을 눌러주세요!';
    progressArea.style.display='none'; feedbackTextElement.textContent='';
    optionsArea.innerHTML=''; nextQuestionBtn.style.display='none'; hintBtn.style.display='none';
}

async function startGame(daily=false) {
    isDailyMode=daily; score=0; currentQuestionIndex=0; totalHintsUsed=0; currentQuestionHintUsed=false;
    hintsRemainingElement.textContent=0; gameStartTime=Date.now(); gameElapsedSec=0; answerLog=[];
    shuffledGameLocations = daily ? getDailyLocations() : shuffleArray([...locations]).slice(0,MAX_QUESTIONS_PER_GAME);
    totalQuestionsElement.textContent=shuffledGameLocations.length;
    progressArea.style.display='block';
    questionTextElement.textContent='지도 로딩 중... 잠시만 기다려주세요.';
    restartBtn.disabled=true;
    if (!map) {
        try { await initMap(); }
        catch(e) { mapErrorInfo.textContent='지도 초기화 실패.'; restartBtn.disabled=false; return; }
    } else {
        if (marker&&map.hasLayer(marker)) marker.remove();
        if (geoJsonLayer) geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));
    }
    restartBtn.disabled=false; restartBtn.textContent='처음으로';
    nextQuestionBtn.style.display='none'; hintBtn.style.display='inline-flex';
    hintBtn.disabled=false; hintBtn.classList.remove('opacity-50','cursor-not-allowed');
    if (map) loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex>=shuffledGameLocations.length) { endGame(); return; }
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const loc=shuffledGameLocations[currentQuestionIndex];
    correctAnswerName=loc.name; currentQuestionHintUsed=false; questionTimeLeft=questionTimeLimit;
    questionTextElement.textContent='빨간색으로 표시된 주(State)는 어디일까요?';
    currentQuestionElement.textContent=currentQuestionIndex+1;
    if (geoJsonLayer) geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));
    highlightState(loc.geoName);
    const latLng=[loc.lat, loc.lng];
    if (marker) marker.setLatLng(latLng).addTo(map); else marker=L.marker(latLng).addTo(map);

    // 알래스카·하와이는 별도 처리
    if (loc.geoName==='Alaska') map.setView([64, -153], 4);
    else if (loc.geoName==='Hawaii') map.setView([20, -157], 6);
    else map.setView([38.5, -96], 4);

    setTimeout(()=>{ if(map) map.flyTo(latLng, loc.zoom, {duration:1}); }, CITY_VIEW_DELAY);

    optionsArea.innerHTML='';
    generateOptions(correctAnswerName).forEach(optName => {
        const btn=document.createElement('button');
        btn.className='option-button w-full bg-white hover:bg-red-50 text-red-700 font-semibold py-2 px-3 border border-red-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400';
        // 한글 + 영어 두 줄
        const loc2=locations.find(l=>l.name===optName);
        btn.innerHTML=`<span class="block text-xs sm:text-sm font-bold">${optName}</span><span class="block text-[10px] sm:text-xs text-red-400">${loc2?loc2.en:''}</span>`;
        btn.onclick=()=>handleAnswer(optName,btn);
        optionsArea.appendChild(btn);
    });
    feedbackTextElement.textContent=''; feedbackTextElement.className='text-md sm:text-lg font-medium';
    nextQuestionBtn.style.display='none';

    if (isKidsMode) {
        hintBtn.style.display='none';
        const loc2=shuffledGameLocations[currentQuestionIndex];
        setTimeout(()=>{
            feedbackTextElement.textContent=`💡 힌트: ${maskHint(loc2.hint, correctAnswerName)}`;
            feedbackTextElement.className='text-md font-medium text-amber-600';
        }, CITY_VIEW_DELAY+500);
    } else {
        hintBtn.style.display='inline-flex';
        setTimeout(()=>startQuestionTimer(), CITY_VIEW_DELAY+1000);
    }
}

function handleAnswer(selectedName, buttonElement) {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    Array.from(optionsArea.children).forEach(btn=>{btn.disabled=true;btn.classList.add('opacity-70','cursor-not-allowed');});
    const loc=shuffledGameLocations[currentQuestionIndex];
    const isCorrect=selectedName===correctAnswerName;
    const timeTaken=questionTimeLimit-questionTimeLeft;
    answerLog.push({name:correctAnswerName, correct:isCorrect, timeTaken});
    saveLocationStats(correctAnswerName, isCorrect);
    const timeBonus=questionTimeLeft>0?(questionTimeLeft/questionTimeLimit):0;
    if (isCorrect) {
        let gained=currentQuestionHintUsed?0.5:Math.round((0.5+timeBonus*0.5)*10)/10;
        score+=gained;
        const timeMsg=currentQuestionHintUsed?'':' ⚡ 빠른 정답 보너스!';
        feedbackTextElement.innerHTML=`<span class="text-green-600 font-bold">정답입니다! 🎉 (+${gained}점)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-green-500','text-white','border-green-700');
    } else {
        feedbackTextElement.innerHTML=`<span class="text-red-600 font-bold">오답입니다. 정답은 ${correctAnswerName} 입니다. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-red-500','text-white','border-red-700');
        Array.from(optionsArea.children).forEach(btn=>{
            if(btn.querySelector('span')?.textContent===correctAnswerName){
                btn.classList.remove('opacity-70');btn.classList.add('bg-green-500','text-white','border-green-700');
            }
        });
    }
    let cd=4;
    const btnLabel=(currentQuestionIndex<shuffledGameLocations.length-1)?'다음 문제':'결과 보기';
    nextQuestionBtn.textContent=`${btnLabel} (${cd}초)`; nextQuestionBtn.style.display='inline-block'; hintBtn.style.display='none';
    countdownInterval=setInterval(()=>{cd--;if(cd>0)nextQuestionBtn.textContent=`${btnLabel} (${cd}초)`;else clearInterval(countdownInterval);},1000);
    autoNextTimer=setTimeout(()=>{if(currentQuestionIndex<shuffledGameLocations.length-1)moveToNextQuestion();else endGame();},4000);
}

function useHint() {
    if (!currentQuestionHintUsed){totalHintsUsed++;currentQuestionHintUsed=true;hintsRemainingElement.textContent=totalHintsUsed;}
    const loc=shuffledGameLocations[currentQuestionIndex];
    feedbackTextElement.textContent=`💡 힌트: ${maskHint(loc.hint, correctAnswerName)}`;
    feedbackTextElement.className='text-md font-medium text-amber-600';
}

function moveToNextQuestion(){currentQuestionIndex++;loadQuestion();}

function endGame() {
    stopQuestionTimer();
    if(autoNextTimer)clearTimeout(autoNextTimer);
    if(countdownInterval)clearInterval(countdownInterval);
    const te=document.getElementById('question-timer');if(te)te.remove();
    gameElapsedSec=Math.round((Date.now()-gameStartTime)/1000);
    const mins=Math.floor(gameElapsedSec/60),secs=gameElapsedSec%60;
    const timeStr=mins>0?`${mins}분 ${secs}초`:`${secs}초`;
    const roundedScore=Math.round(score*10)/10;
    const total=shuffledGameLocations.length;
    const correctCount=answerLog.filter(l=>l.correct).length;
    const accuracy=Math.round((correctCount/total)*100);
    const avgTime=answerLog.length?Math.round(answerLog.reduce((s,l)=>s+l.timeTaken,0)/answerLog.length):0;
    const prev=JSON.parse(localStorage.getItem(LS_BEST)||'null');
    const isNewBest=!prev||roundedScore>prev.score||(roundedScore===prev.score&&gameElapsedSec<prev.elapsed);
    if(isNewBest)localStorage.setItem(LS_BEST,JSON.stringify({score:roundedScore,elapsed:gameElapsedSec,date:new Date().toLocaleDateString('ko-KR')}));
    const bestData=JSON.parse(localStorage.getItem(LS_BEST));
    if(isDailyMode)saveDailyResult(roundedScore,gameElapsedSec);
    questionTextElement.textContent=`게임 종료! 최종 점수: ${roundedScore} / ${total}`;
    progressArea.style.display='none'; hintBtn.style.display='none'; nextQuestionBtn.style.display='none'; restartBtn.textContent='처음으로';
    const dailyBanner=isDailyMode?`<div class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-bold">📅 오늘의 챌린지 완료! ${getTodayKey()}</div>`:'';
    optionsArea.innerHTML=`
      <div class="col-span-4 space-y-4">
        ${dailyBanner}
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-red-50 rounded-xl p-3 border border-red-100"><p class="text-xs text-red-400 font-semibold mb-1">최종 점수</p><p class="text-2xl font-extrabold text-red-600">${roundedScore}<span class="text-sm font-normal text-red-400">/${total}</span></p></div>
          <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100"><p class="text-xs text-emerald-400 font-semibold mb-1">정답률</p><p class="text-2xl font-extrabold text-emerald-600">${accuracy}<span class="text-sm font-normal text-emerald-400">%</span></p></div>
          <div class="bg-amber-50 rounded-xl p-3 border border-amber-100"><p class="text-xs text-amber-400 font-semibold mb-1">소요 시간</p><p class="text-lg font-extrabold text-amber-600">${timeStr}</p><p class="text-xs text-amber-400">평균 ${avgTime}초/문제</p></div>
        </div>
        <div class="flex items-center justify-between bg-gradient-to-r from-red-50 to-orange-50 rounded-xl px-4 py-3 border border-red-100">
          <span class="text-sm font-bold text-red-700">🏆 역대 최고 점수</span>
          <span class="text-sm font-bold text-red-600">${bestData?`${bestData.score}점 · ${bestData.date}`:'-'}${isNewBest?'<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>':''}</span>
        </div>
        <div><p class="text-sm font-bold text-gray-600 mb-2">📊 이번 게임 정오답</p>
          <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
            ${answerLog.map(l=>`<div class="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${l.correct?'bg-green-50 border border-green-100':'bg-red-50 border border-red-100'}"><span class="${l.correct?'text-green-700':'text-red-700'} font-semibold">${l.correct?'✅':'❌'} ${l.name}</span><span class="text-gray-400">${l.timeTaken}초</span></div>`).join('')}
          </div>
        </div>
        ${renderWeakStats()}
        <div class="grid grid-cols-2 gap-2">
          <button id="btn-kakao-share" class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.627 1.638 4.938 4.125 6.3-.18.67-.657 2.43-.752 2.806-.117.46.169.454.356.33.146-.097 2.32-1.574 3.26-2.215.65.09 1.32.138 2.011.138 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/></svg>
            카카오 공유
          </button>
          <button id="btn-link-share" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            링크 복사
          </button>
        </div>
      </div>`;
    document.getElementById('btn-kakao-share').onclick=()=>{
        const url=window.location.href.split('?')[0];
        const text=`🇺🇸 미국 주 퀴즈\n점수: ${roundedScore}/${total} · 정답률 ${accuracy}% · ${timeStr}\n지금 도전! 👇\n${url}`;
        if(window.Kakao&&window.Kakao.isInitialized()){
            window.Kakao.Share.sendDefault({objectType:'feed',content:{title:'🇺🇸 미국 주 퀴즈 결과',description:text,imageUrl:'https://isw360.github.io/k-cityquiz/korea_seoul_map.png',link:{mobileWebUrl:url,webUrl:url}},buttons:[{title:'나도 도전하기',link:{mobileWebUrl:url,webUrl:url}}]});
        } else { navigator.clipboard.writeText(text).then(()=>alert('클립보드에 복사되었습니다!')); }
    };
    document.getElementById('btn-link-share').onclick=()=>{
        const text=`🇺🇸 미국 주 퀴즈\n점수: ${roundedScore}/${total} · 정답률 ${accuracy}% · ${timeStr}\n지금 도전! 👇\n${window.location.href.split('?')[0]}`;
        navigator.clipboard.writeText(text).then(()=>alert('링크가 클립보드에 복사되었습니다!'));
    };
    if(marker&&map&&map.hasLayer(marker))marker.remove();
    if(geoJsonLayer)geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));
}

function saveLocationStats(name,isCorrect){
    const s=JSON.parse(localStorage.getItem(LS_STATS)||'{}');
    if(!s[name])s[name]={correct:0,wrong:0};
    if(isCorrect)s[name].correct++;else s[name].wrong++;
    localStorage.setItem(LS_STATS,JSON.stringify(s));
}
function renderWeakStats(){
    const s=JSON.parse(localStorage.getItem(LS_STATS)||'{}');
    const e=Object.entries(s).filter(([,v])=>v.wrong>0).sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,5);
    if(!e.length)return'';
    const bars=e.map(([name,v])=>{
        const t=v.correct+v.wrong,p=Math.round((v.wrong/t)*100);
        return`<div><div class="flex justify-between text-xs text-gray-500 mb-0.5"><span class="font-semibold text-gray-700">${name}</span><span>${v.wrong}번 틀림 / ${t}번 출제</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-red-400 h-2 rounded-full" style="width:${p}%"></div></div></div>`;
    }).join('');
    return`<div><p class="text-sm font-bold text-gray-600 mb-2">📉 자주 틀리는 주 (누적)</p><div class="space-y-2">${bars}</div></div>`;
}
function maskHint(hint,name){
    const escaped=name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return hint.replace(new RegExp(escaped,'g'),'〇〇');
}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function generateOptions(correct){
    const o=[correct];
    const d=shuffleArray(locations.map(l=>l.name).filter(n=>n!==correct));
    for(let i=0;i<numOptions-1&&i<d.length;i++)o.push(d[i]);
    return shuffleArray(o);
}

level1Btn.addEventListener('click',()=>selectDifficulty(1));
level2Btn.addEventListener('click',()=>selectDifficulty(2));
restartBtn.addEventListener('click',showDifficultyScreen);
hintBtn.addEventListener('click',useHint);
const toggleGuideBtn=document.getElementById('toggle-guide-btn');
const detailedGuide=document.getElementById('detailed-guide');
if(toggleGuideBtn&&detailedGuide){
    toggleGuideBtn.addEventListener('click',()=>{
        const h=detailedGuide.classList.contains('hidden');
        detailedGuide.classList.toggle('hidden',!h);
        toggleGuideBtn.textContent=h?'게임 상세 소개 닫기':'게임 상세 소개 열기';
    });
}
nextQuestionBtn.addEventListener('click',()=>{
    stopQuestionTimer();
    if(autoNextTimer)clearTimeout(autoNextTimer);
    if(countdownInterval)clearInterval(countdownInterval);
    if(currentQuestionIndex<shuffledGameLocations.length-1)moveToNextQuestion();else endGame();
});