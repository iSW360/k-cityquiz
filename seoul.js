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

let map;
let marker;
let geoJsonLayer; 

// --- 서울 구 데이터 ---
const locations = [
    { name: "종로구", lat: 37.5730, lng: 126.9794, zoom: 12, geoName: "종로구" },
    { name: "중구", lat: 37.5641, lng: 126.9979, zoom: 13, geoName: "중구" },
    { name: "용산구", lat: 37.5326, lng: 126.9904, zoom: 12, geoName: "용산구" },
    { name: "성동구", lat: 37.5633, lng: 127.0371, zoom: 12, geoName: "성동구" },
    { name: "광진구", lat: 37.5385, lng: 127.0824, zoom: 12, geoName: "광진구" },
    { name: "동대문구", lat: 37.5744, lng: 127.0400, zoom: 12, geoName: "동대문구" },
    { name: "중랑구", lat: 37.6065, lng: 127.0927, zoom: 12, geoName: "중랑구" },
    { name: "성북구", lat: 37.5891, lng: 127.0182, zoom: 12, geoName: "성북구" },
    { name: "강북구", lat: 37.6396, lng: 127.0257, zoom: 12, geoName: "강북구" },
    { name: "도봉구", lat: 37.6688, lng: 127.0471, zoom: 12, geoName: "도봉구" },
    { name: "노원구", lat: 37.6542, lng: 127.0568, zoom: 12, geoName: "노원구" },
    { name: "은평구", lat: 37.6027, lng: 126.9291, zoom: 12, geoName: "은평구" },
    { name: "서대문구", lat: 37.5791, lng: 126.9368, zoom: 12, geoName: "서대문구" },
    { name: "마포구", lat: 37.5662, lng: 126.9016, zoom: 12, geoName: "마포구" },
    { name: "양천구", lat: 37.5169, lng: 126.8665, zoom: 12, geoName: "양천구" },
    { name: "강서구", lat: 37.5509, lng: 126.8495, zoom: 11, geoName: "강서구" },
    { name: "구로구", lat: 37.4954, lng: 126.8875, zoom: 12, geoName: "구로구" },
    { name: "금천구", lat: 37.4568, lng: 126.8952, zoom: 12, geoName: "금천구" },
    { name: "영등포구", lat: 37.5264, lng: 126.8962, zoom: 12, geoName: "영등포구" },
    { name: "동작구", lat: 37.5124, lng: 126.9395, zoom: 12, geoName: "동작구" },
    { name: "관악구", lat: 37.4784, lng: 126.9515, zoom: 12, geoName: "관악구" },
    { name: "서초구", lat: 37.4837, lng: 127.0324, zoom: 11, geoName: "서초구" },
    { name: "강남구", lat: 37.4959, lng: 127.0664, zoom: 11, geoName: "강남구" },
    { name: "송파구", lat: 37.5145, lng: 127.1061, zoom: 11, geoName: "송파구" },
    { name: "강동구", lat: 37.5301, lng: 127.1238, zoom: 12, geoName: "강동구" }
];

let shuffledGameLocations = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswerName = '';
let numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const PROVINCE_VIEW_ZOOM = 11; // 서울 집중 줌
const CITY_VIEW_DELAY = 1000;

function getColorForRegion(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }
    const hue = 210; // 서울 테마 (블루 계열)
    const lightness = 40 + (hash % 30); 
    return `hsl(${hue}, 60%, ${lightness}%)`;
}

async function initMap() {
    mapErrorInfo.textContent = '지도 데이터 로딩 중...';
    if (map) {
        map.remove();
    }
    // 서울 중심으로 시작
    map = L.map('map').setView([37.5665, 126.9780], 11);

    const cartoTileUrl = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
    const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

    L.tileLayer(cartoTileUrl, {
        attribution: cartoAttribution,
        subdomains: 'abcd', maxZoom: 19
    }).addTo(map);

    const geoJsonUrl = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json';

    try {
        const response = await fetch(geoJsonUrl);
        const data = await response.json();
        
        // 서울 데이터만 필터링 (코드 11로 시작)
        const seoulData = {
            type: "FeatureCollection",
            features: data.features.filter(f => f.properties.code && f.properties.code.startsWith('11'))
        };

        if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
        geoJsonLayer = L.geoJSON(seoulData, {
            style: function (feature) {
                const name = feature.properties.name || '';
                const color = getColorForRegion(name);
                return { color: color, weight: 1.5, opacity: 0.8, fillOpacity: 0.3, fillColor: color };
            },
            onEachFeature: function (feature, layer) {
                layer.on({
                    mouseover: function (e) {
                        const l = e.target;
                        l.setStyle({ weight: 3, fillOpacity: 0.5 });
                    },
                    mouseout: function (e) {
                        if (geoJsonLayer) geoJsonLayer.resetStyle(e.target);
                    }
                });
            }
        }).addTo(map);
        mapErrorInfo.textContent = '';
    } catch (error) {
        console.error('Error loading GeoJSON:', error);
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
                layer.setStyle({
                    weight: 4,          
                    color: '#c00',        
                    fillOpacity: 0.6,   
                    fillColor: '#ffeb3b' 
                });
                layer.bringToFront();
            } else {
                geoJsonLayer.resetStyle(layer);
            }
        });
    }
}

function selectDifficulty(level) {
    numOptions = (level === 2) ? 8 : 4;
    difficultySelector.style.display = 'none';
    quizContainer.style.display = 'block';
    startGame();
}

function showDifficultyScreen() {
    quizContainer.style.display = 'none';
    difficultySelector.style.display = 'block';
    feedbackTextElement.textContent = '';
    optionsArea.innerHTML = '';
    nextQuestionBtn.style.display = 'none';
}

async function startGame() { 
    score = 0;
    currentQuestionIndex = 0;
    
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
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= shuffledGameLocations.length) {
        endGame();
        return;
    }

    const currentLocation = shuffledGameLocations[currentQuestionIndex];
    correctAnswerName = currentLocation.name;
    
    questionTextElement.textContent = "이곳은 서울의 어느 구일까요?";
    currentQuestionElement.textContent = currentQuestionIndex + 1;

    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    highlightCurrentQuestionRegion(currentLocation.geoName);

    const latLng = [currentLocation.lat, currentLocation.lng];
    if (marker) marker.setLatLng(latLng).addTo(map);
    
    map.setView(latLng, PROVINCE_VIEW_ZOOM);
    
    setTimeout(() => {
        if (map) map.flyTo(latLng, currentLocation.zoom || 12, {duration: 1}); 
    }, CITY_VIEW_DELAY);
    
    optionsArea.innerHTML = ''; 
    const options = generateOptions(correctAnswerName);
    
    options.forEach(optionName => {
        const button = document.createElement('button');
        button.textContent = optionName;
        button.className = "option-button w-full bg-white hover:bg-blue-100 text-blue-700 font-semibold py-2 px-3 border border-blue-300 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out focus:outline-none";
        button.onclick = () => handleAnswer(optionName, button); 
        optionsArea.appendChild(button);
    });

    feedbackTextElement.textContent = ''; 
    nextQuestionBtn.style.display = 'none';
}

function handleAnswer(selectedName, buttonElement) {
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    });

    if (selectedName === correctAnswerName) {
        score++;
        feedbackTextElement.textContent = '정답입니다! 👏';
        feedbackTextElement.className = 'text-md sm:text-lg font-medium text-green-600';
        buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        feedbackTextElement.textContent = `오답입니다. 정답은 ${correctAnswerName} 입니다.`;
        feedbackTextElement.className = 'text-md sm:text-lg font-medium text-red-600';
        buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-700');

        Array.from(optionsArea.children).forEach(btn => {
            if (btn.textContent === correctAnswerName) {
                btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
            }
        });
    }
    
    nextQuestionBtn.textContent = (currentQuestionIndex < shuffledGameLocations.length - 1) ? '다음 문제' : '결과 보기';
    nextQuestionBtn.style.display = 'inline-block';
}

function endGame() {
    questionTextElement.textContent = `게임 종료! 점수: ${score} / ${shuffledGameLocations.length}`;
    optionsArea.innerHTML = '';
    feedbackTextElement.textContent = '수고하셨습니다!';
    feedbackTextElement.className = 'text-md sm:text-lg font-medium text-purple-700';
    progressArea.style.display = 'none'; 
    nextQuestionBtn.style.display = 'none';
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
    for (let i = 0; i < numOptions - 1; i++) {
        options.push(distractors[i]);
    }
    return shuffleArray(options); 
}

level1Btn.addEventListener('click', () => selectDifficulty(1));
level2Btn.addEventListener('click', () => selectDifficulty(2));
restartBtn.addEventListener('click', showDifficultyScreen);
nextQuestionBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    loadQuestion();
});
