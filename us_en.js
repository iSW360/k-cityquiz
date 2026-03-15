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
let questionTimer = null, questionTimeLeft = 0;
let questionTimeLimit = 10;
let gameStartTime = null, gameElapsedSec = 0, answerLog = [];
const LS_BEST  = 'kcityquiz_us_en_best';
const LS_STATS = 'kcityquiz_us_en_stats';
const LS_DAILY = 'kcityquiz_us_en_daily';
let isDailyMode = false;

// --- 50 States Data (English hints) ---
const locations = [
    { name: "Alabama",       lat: 32.806671, lng: -86.791130,  zoom: 5,  geoName: "Alabama",       hint: "Home to NASA's Marshall Space Flight Center in Huntsville and rich Civil War history." },
    { name: "Alaska",        lat: 64.200841, lng: -153.406550, zoom: 3,  geoName: "Alaska",         hint: "The largest US state by area, famous for the Northern Lights, glaciers, and wildlife." },
    { name: "Arizona",       lat: 34.048928, lng: -111.093731, zoom: 5,  geoName: "Arizona",        hint: "Home to the Grand Canyon, Sedona's red rocks, and the Sonoran Desert." },
    { name: "Arkansas",      lat: 34.799999, lng: -92.199999,  zoom: 5,  geoName: "Arkansas",       hint: "Birthplace of President Bill Clinton, known for Hot Springs National Park." },
    { name: "California",    lat: 36.778259, lng: -119.417931, zoom: 4,  geoName: "California",     hint: "Home to Hollywood, Silicon Valley, the Golden Gate Bridge, and Yosemite." },
    { name: "Colorado",      lat: 39.550051, lng: -105.782067, zoom: 5,  geoName: "Colorado",       hint: "Known for the Rocky Mountains, world-class ski resorts, and Colorado Springs." },
    { name: "Connecticut",   lat: 41.603221, lng: -73.087749,  zoom: 6,  geoName: "Connecticut",    hint: "One of the smallest states, home to Yale University and the Ivy League tradition." },
    { name: "Delaware",      lat: 38.910832, lng: -75.527670,  zoom: 6,  geoName: "Delaware",       hint: "The 'First State' — the first to ratify the US Constitution in 1787." },
    { name: "Florida",       lat: 27.994402, lng: -81.760254,  zoom: 5,  geoName: "Florida",        hint: "Home to Walt Disney World, Miami Beach, the Everglades, and Kennedy Space Center." },
    { name: "Georgia",       lat: 32.165622, lng: -82.900075,  zoom: 5,  geoName: "Georgia",        hint: "Headquarters of Coca-Cola, birthplace of Martin Luther King Jr., and famous for peaches." },
    { name: "Hawaii",        lat: 19.896766, lng: -155.582782, zoom: 5,  geoName: "Hawaii",         hint: "A Pacific volcanic archipelago — the birthplace of surfing and hula dancing." },
    { name: "Idaho",         lat: 44.068202, lng: -114.742041, zoom: 5,  geoName: "Idaho",          hint: "The world's top potato-producing state, home to Craters of the Moon National Monument." },
    { name: "Illinois",      lat: 40.000000, lng: -89.000000,  zoom: 5,  geoName: "Illinois",       hint: "Home to Chicago's deep-dish pizza, Willis Tower (Sears Tower), and Lake Michigan." },
    { name: "Indiana",       lat: 40.273502, lng: -86.126976,  zoom: 5,  geoName: "Indiana",        hint: "World-famous for the Indianapolis 500, the greatest spectacle in motor racing." },
    { name: "Iowa",          lat: 41.878003, lng: -93.097702,  zoom: 5,  geoName: "Iowa",           hint: "The leading producer of corn and soybeans in America, known for its caucuses." },
    { name: "Kansas",        lat: 38.500000, lng: -98.000000,  zoom: 5,  geoName: "Kansas",         hint: "The geographic center of the contiguous US, the 'Wheat State' of the Great Plains." },
    { name: "Kentucky",      lat: 37.839333, lng: -84.270018,  zoom: 5,  geoName: "Kentucky",       hint: "Birthplace of Kentucky Fried Chicken, famous for bourbon whiskey and horse racing." },
    { name: "Louisiana",     lat: 30.984298, lng: -91.962333,  zoom: 5,  geoName: "Louisiana",      hint: "Home to New Orleans jazz, Mardi Gras festival, and Cajun cuisine." },
    { name: "Maine",         lat: 45.253783, lng: -69.445469,  zoom: 5,  geoName: "Maine",          hint: "The northeasternmost state, nationally famous for lobster and wild blueberries." },
    { name: "Maryland",      lat: 39.045755, lng: -76.641271,  zoom: 6,  geoName: "Maryland",       hint: "Famous for Chesapeake Bay blue crabs, surrounding Washington D.C." },
    { name: "Massachusetts", lat: 42.407211, lng: -71.382437,  zoom: 6,  geoName: "Massachusetts",  hint: "Home to Harvard, MIT, the Boston Marathon, and the historic Mayflower landing." },
    { name: "Michigan",      lat: 44.314844, lng: -85.602364,  zoom: 5,  geoName: "Michigan",       hint: "The heart of the US auto industry in Detroit, Motown music birthplace, and the Great Lakes." },
    { name: "Minnesota",     lat: 46.729553, lng: -94.685900,  zoom: 5,  geoName: "Minnesota",      hint: "The 'Land of 10,000 Lakes,' home to the Mayo Clinic and Prince." },
    { name: "Mississippi",   lat: 32.354668, lng: -89.398528,  zoom: 5,  geoName: "Mississippi",    hint: "The birthplace of blues music, along the mighty Mississippi River." },
    { name: "Missouri",      lat: 37.964253, lng: -91.831833,  zoom: 5,  geoName: "Missouri",       hint: "Home to the Gateway Arch in St. Louis and famous Kansas City BBQ." },
    { name: "Montana",       lat: 46.879682, lng: -110.362566, zoom: 4,  geoName: "Montana",        hint: "Known as 'Big Sky Country,' home to Glacier National Park and Yellowstone." },
    { name: "Nebraska",      lat: 41.492537, lng: -99.901810,  zoom: 5,  geoName: "Nebraska",       hint: "Birthplace of Warren Buffett in Omaha, vast Great Plains and Chimney Rock." },
    { name: "Nevada",        lat: 38.802610, lng: -116.419389, zoom: 5,  geoName: "Nevada",         hint: "Home to Las Vegas casinos, the Hoover Dam, and stunning desert landscapes." },
    { name: "New Hampshire", lat: 43.193852, lng: -71.572395,  zoom: 6,  geoName: "New Hampshire",  hint: "Famous for fall foliage, 'Live Free or Die' motto, and being the first primary state." },
    { name: "New Jersey",    lat: 40.058324, lng: -74.405661,  zoom: 6,  geoName: "New Jersey",     hint: "Home to Edison's invention lab and the Jersey Shore, adjacent to New York City." },
    { name: "New Mexico",    lat: 34.519940, lng: -105.870090, zoom: 5,  geoName: "New Mexico",     hint: "Famous for Roswell UFO legends, White Sands, and Los Alamos National Laboratory." },
    { name: "New York",      lat: 42.165726, lng: -74.948051,  zoom: 5,  geoName: "New York",       hint: "Home to the Statue of Liberty, Times Square, and Wall Street — a true world city." },
    { name: "North Carolina",lat: 35.630066, lng: -79.806419,  zoom: 5,  geoName: "North Carolina", hint: "Site of the Wright Brothers' first flight and home to the Research Triangle tech hub." },
    { name: "North Dakota",  lat: 47.528912, lng: -99.784012,  zoom: 5,  geoName: "North Dakota",   hint: "One of the northernmost states, a major producer of sunflowers and wheat." },
    { name: "Ohio",          lat: 40.417287, lng: -82.907123,  zoom: 5,  geoName: "Ohio",           hint: "Birthplace of astronauts Neil Armstrong and John Glenn, hub of aerospace." },
    { name: "Oklahoma",      lat: 35.007752, lng: -97.092877,  zoom: 5,  geoName: "Oklahoma",       hint: "Known for the Oklahoma City bombing memorial, oil industry, and Cherokee heritage." },
    { name: "Oregon",        lat: 43.804133, lng: -120.554201, zoom: 5,  geoName: "Oregon",         hint: "Famous for Portland's coffee culture, Crater Lake National Park, and scenic coastlines." },
    { name: "Pennsylvania",  lat: 41.203322, lng: -77.194525,  zoom: 5,  geoName: "Pennsylvania",   hint: "The Declaration of Independence was signed in Philadelphia; Pittsburgh is the Steel City." },
    { name: "Rhode Island",  lat: 41.700001, lng: -71.500000,  zoom: 7,  geoName: "Rhode Island",   hint: "The smallest US state, famous for Newport yacht racing and colonial architecture." },
    { name: "South Carolina",lat: 33.836081, lng: -81.163725,  zoom: 5,  geoName: "South Carolina", hint: "The first shots of the Civil War were fired at Fort Sumter in Charleston Harbor." },
    { name: "South Dakota",  lat: 43.969515, lng: -99.901810,  zoom: 5,  geoName: "South Dakota",   hint: "Home to Mount Rushmore's presidential sculpture and Badlands National Park." },
    { name: "Tennessee",     lat: 35.517491, lng: -86.580447,  zoom: 5,  geoName: "Tennessee",      hint: "Nashville is the country music capital; Memphis is the home of Elvis and the blues." },
    { name: "Texas",         lat: 31.000000, lng: -100.000000, zoom: 4,  geoName: "Texas",          hint: "The second-largest state, home to NASA's Johnson Space Center and Texas BBQ." },
    { name: "Utah",          lat: 39.320980, lng: -111.093731, zoom: 5,  geoName: "Utah",           hint: "The 'Mighty Five' — five stunning national parks including Arches and Zion." },
    { name: "Vermont",       lat: 44.045876, lng: -72.710686,  zoom: 6,  geoName: "Vermont",        hint: "America's top maple syrup producer, known for skiing and brilliant fall foliage." },
    { name: "Virginia",      lat: 37.431573, lng: -78.656894,  zoom: 5,  geoName: "Virginia",       hint: "Site of America's first permanent settlement at Jamestown; birthplace of George Washington." },
    { name: "Washington",    lat: 47.751074, lng: -120.740139, zoom: 5,  geoName: "Washington",     hint: "Seattle's Space Needle; headquarters of Microsoft, Amazon, and Starbucks." },
    { name: "West Virginia", lat: 38.597626, lng: -80.454903,  zoom: 5,  geoName: "West Virginia",  hint: "Separated from Virginia during the Civil War, with a long coal-mining heritage." },
    { name: "Wisconsin",     lat: 43.784440, lng: -88.787868,  zoom: 5,  geoName: "Wisconsin",      hint: "America's top cheese-producing state — fans are proudly called 'Cheeseheads.'" },
    { name: "Wyoming",       lat: 43.075968, lng: -107.290284, zoom: 5,  geoName: "Wyoming",        hint: "Home to the world's first national park, Yellowstone, and Grand Teton." },
];

let shuffledGameLocations = [], currentQuestionIndex = 0, score = 0;
let correctAnswerName = '', numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const CITY_VIEW_DELAY = 1500;

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function getDailyLocations() {
    const seed = parseInt(getTodayKey().replace(/-/g,''), 10);
    const arr = [...locations]; let s = seed;
    function rand() { s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296; }
    for(let i=arr.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}
    return arr.slice(0, MAX_QUESTIONS_PER_GAME);
}
function getDailyStatus() { const s=JSON.parse(localStorage.getItem(LS_DAILY)||'null'); return(s&&s.date===getTodayKey())?s:null; }
function saveDailyResult(score,elapsed) { localStorage.setItem(LS_DAILY,JSON.stringify({date:getTodayKey(),score,elapsed})); }
let isKidsMode = false;

function startDailyChallenge() {
    const status=getDailyStatus();
    if(status){alert(`Today's challenge is already done! 🎉\nScore: ${status.score} / ${MAX_QUESTIONS_PER_GAME}\nCome back tomorrow!`);return;}
    isDailyMode=true; isKidsMode=false;
    numOptions=8; questionTimeLimit=15;
    difficultySelector.style.display='none';quizContainer.style.display='block';startGame(true);
}

function createTimerUI() {
    const e=document.getElementById('question-timer');if(e)e.remove();
    const el=document.createElement('div');el.id='question-timer';el.className='flex items-center justify-center gap-2 mb-3';
    el.innerHTML=`<div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden"><div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500" style="width:100%"></div></div><span id="timer-text" class="text-sm font-bold text-red-600 min-w-[2.5rem] text-right">${questionTimeLimit}s</span>`;
    const qa=document.getElementById('question-area');qa.parentNode.insertBefore(el,qa);
}
function startQuestionTimer() {
    if(questionTimer)clearInterval(questionTimer);questionTimeLeft=questionTimeLimit;createTimerUI();
    const bar=document.getElementById('timer-bar'),txt=document.getElementById('timer-text');
    questionTimer=setInterval(()=>{
        questionTimeLeft--;const pct=(questionTimeLeft/questionTimeLimit)*100;
        if(bar)bar.style.width=pct+'%';if(txt)txt.textContent=questionTimeLeft+'s';
        if(bar){if(questionTimeLeft<=3){bar.className='h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500';if(txt)txt.className='text-sm font-bold text-red-600 min-w-[2.5rem] text-right';}
        else if(questionTimeLeft<=6){bar.className='h-3 rounded-full transition-all duration-1000 ease-linear bg-amber-500';if(txt)txt.className='text-sm font-bold text-amber-600 min-w-[2.5rem] text-right';}}
        if(questionTimeLeft<=0){clearInterval(questionTimer);handleTimeOut();}
    },1000);
}
function stopQuestionTimer(){if(questionTimer){clearInterval(questionTimer);questionTimer=null;}}

function handleTimeOut() {
    stopQuestionTimer();
    answerLog.push({name:correctAnswerName,correct:false,timeTaken:questionTimeLimit});
    saveLocationStats(correctAnswerName,false);
    Array.from(optionsArea.children).forEach(btn=>{
        btn.disabled=true;btn.classList.add('opacity-70','cursor-not-allowed');
        if(btn.dataset.key===correctAnswerName){btn.classList.remove('opacity-70');btn.classList.add('bg-green-500','text-white','border-green-700');}
    });
    feedbackTextElement.innerHTML=`<span class="text-orange-600 font-bold">⏰ Time's up! The answer was <strong>${correctAnswerName}</strong>.</span>`;
    const isLast=currentQuestionIndex>=shuffledGameLocations.length-1;
    nextQuestionBtn.textContent=isLast?'Results (3s)':'Next (3s)';nextQuestionBtn.style.display='inline-block';hintBtn.style.display='none';
    let cd=3;countdownInterval=setInterval(()=>{cd--;if(cd>0)nextQuestionBtn.textContent=isLast?`Results (${cd}s)`:`Next (${cd}s)`;else clearInterval(countdownInterval);},1000);
    autoNextTimer=setTimeout(()=>{if(!isLast){currentQuestionIndex++;loadQuestion();}else endGame();},3000);
}

async function initMap() {
    mapErrorInfo.textContent='Loading map data...';
    if(map)map.remove();
    map=L.map('map').setView([38.5,-96],4);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',{attribution:'&copy; OpenStreetMap &copy; CARTO',subdomains:'abcd',maxZoom:19}).addTo(map);
    try {
        const res=await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
        if(!res.ok)throw new Error(`HTTP ${res.status}`);
        const data=await res.json();
        if(geoJsonLayer&&map.hasLayer(geoJsonLayer))geoJsonLayer.remove();
        geoJsonLayer=L.geoJSON(data,{
            style:f=>{const n=f.properties.name||'';const hue=(n.charCodeAt(0)*7+(n.charCodeAt(1)||0)*13)%360;return{color:`hsl(${hue},55%,48%)`,weight:1.5,opacity:0.8,fillOpacity:0.25,fillColor:`hsl(${hue},55%,58%)`};},
            onEachFeature:(f,layer)=>{layer.on({mouseover:e=>{e.target.setStyle({weight:3,fillOpacity:0.45});if(!L.Browser.ie&&!L.Browser.opera&&!L.Browser.edge)e.target.bringToFront();},mouseout:e=>geoJsonLayer&&geoJsonLayer.resetStyle(e.target)});}
        }).addTo(map);
        mapErrorInfo.textContent='';
    } catch(e){mapErrorInfo.textContent='Failed to load state boundaries.';}
    marker=L.marker([0,0],{icon:L.icon({iconUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',iconSize:[25,41],iconAnchor:[12,41],shadowUrl:'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',shadowSize:[41,41]})});
}

function highlightState(stateName) {
    if(!geoJsonLayer)return;
    geoJsonLayer.eachLayer(layer=>{
        if((layer.feature.properties.name||'')===stateName){layer.setStyle({weight:4,color:'#c00',fillOpacity:0.65,fillColor:'#ffeb3b'});if(!L.Browser.ie&&!L.Browser.opera&&!L.Browser.edge)layer.bringToFront();}
        else geoJsonLayer.resetStyle(layer);
    });
}

function selectDifficulty(level){
    isDailyMode=false; isKidsMode=(level===1);
    numOptions=(level===2)?8:4;
    questionTimeLimit=(level===2)?15:10;
    difficultySelector.style.display='none';quizContainer.style.display='block';startGame();
}

function showDifficultyScreen(){
    stopQuestionTimer();if(autoNextTimer)clearTimeout(autoNextTimer);if(countdownInterval)clearInterval(countdownInterval);
    const te=document.getElementById('question-timer');if(te)te.remove();
    quizContainer.style.display='none';difficultySelector.style.display='block';
    feedbackTextElement.textContent='';optionsArea.innerHTML='';nextQuestionBtn.style.display='none';hintBtn.style.display='none';
}

async function startGame(daily=false){
    isDailyMode=daily;score=0;currentQuestionIndex=0;totalHintsUsed=0;currentQuestionHintUsed=false;
    hintsRemainingElement.textContent=0;gameStartTime=Date.now();gameElapsedSec=0;answerLog=[];
    shuffledGameLocations=daily?getDailyLocations():shuffleArray([...locations]).slice(0,MAX_QUESTIONS_PER_GAME);
    totalQuestionsElement.textContent=shuffledGameLocations.length;progressArea.style.display='block';
    questionTextElement.textContent='Loading map...';restartBtn.disabled=true;
    if(!map){try{await initMap();}catch(e){mapErrorInfo.textContent='Map init failed.';restartBtn.disabled=false;return;}}
    else{if(marker&&map.hasLayer(marker))marker.remove();if(geoJsonLayer)geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));}
    restartBtn.disabled=false;restartBtn.textContent='Restart';
    nextQuestionBtn.style.display='none';hintBtn.style.display='inline-flex';hintBtn.disabled=false;
    hintBtn.classList.remove('opacity-50','cursor-not-allowed');
    if(map)loadQuestion();
}

function loadQuestion(){
    if(currentQuestionIndex>=shuffledGameLocations.length){endGame();return;}
    stopQuestionTimer();if(autoNextTimer)clearTimeout(autoNextTimer);if(countdownInterval)clearInterval(countdownInterval);
    const loc=shuffledGameLocations[currentQuestionIndex];
    correctAnswerName=loc.name;currentQuestionHintUsed=false;questionTimeLeft=questionTimeLimit;
    questionTextElement.textContent='Which state is highlighted in red?';
    currentQuestionElement.textContent=currentQuestionIndex+1;
    if(geoJsonLayer)geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));
    highlightState(loc.geoName);
    const latLng=[loc.lat,loc.lng];
    if(marker)marker.setLatLng(latLng).addTo(map);else marker=L.marker(latLng).addTo(map);
    if(loc.geoName==='Alaska')map.setView([64,-153],4);
    else if(loc.geoName==='Hawaii')map.setView([20,-157],6);
    else map.setView([38.5,-96],4);
    setTimeout(()=>{if(map)map.flyTo(latLng,loc.zoom,{duration:1});},CITY_VIEW_DELAY);
    optionsArea.innerHTML='';
    generateOptions(correctAnswerName).forEach(optName=>{
        const btn=document.createElement('button');
        btn.dataset.key=optName;
        btn.className='option-button w-full bg-white hover:bg-red-50 text-red-700 font-bold py-2 px-3 border border-red-200 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 text-xs sm:text-sm';
        btn.textContent=optName;
        btn.onclick=()=>handleAnswer(optName,btn);
        optionsArea.appendChild(btn);
    });
    feedbackTextElement.textContent='';nextQuestionBtn.style.display='none';

    if(isKidsMode){
        hintBtn.style.display='none';
        setTimeout(()=>{
            feedbackTextElement.textContent=`💡 Hint: ${maskHint(loc.hint,correctAnswerName)}`;
            feedbackTextElement.className='text-md font-medium text-amber-600';
        },CITY_VIEW_DELAY+500);
    } else {
        hintBtn.style.display='inline-flex';
        setTimeout(()=>startQuestionTimer(),CITY_VIEW_DELAY+1000);
    }
}

function handleAnswer(selectedName,buttonElement){
    stopQuestionTimer();if(autoNextTimer)clearTimeout(autoNextTimer);if(countdownInterval)clearInterval(countdownInterval);
    Array.from(optionsArea.children).forEach(btn=>{btn.disabled=true;btn.classList.add('opacity-70','cursor-not-allowed');});
    const loc=shuffledGameLocations[currentQuestionIndex];
    const isCorrect=selectedName===correctAnswerName;
    const timeTaken=questionTimeLimit-questionTimeLeft;
    answerLog.push({name:correctAnswerName,correct:isCorrect,timeTaken});saveLocationStats(correctAnswerName,isCorrect);
    const timeBonus=questionTimeLeft>0?(questionTimeLeft/questionTimeLimit):0;
    if(isCorrect){
        let gained=currentQuestionHintUsed?0.5:Math.round((0.5+timeBonus*0.5)*10)/10;score+=gained;
        const timeMsg=currentQuestionHintUsed?'':' ⚡ Speed bonus!';
        feedbackTextElement.innerHTML=`<span class="text-green-600 font-bold">Correct! 🎉 (+${gained}pt)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint,correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-green-500','text-white','border-green-700');
    } else {
        feedbackTextElement.innerHTML=`<span class="text-red-600 font-bold">Wrong! The answer was <strong>${correctAnswerName}</strong>. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint,correctAnswerName)}</span>`;
        buttonElement.classList.add('bg-red-500','text-white','border-red-700');
        Array.from(optionsArea.children).forEach(btn=>{if(btn.dataset.key===correctAnswerName){btn.classList.remove('opacity-70');btn.classList.add('bg-green-500','text-white','border-green-700');}});
    }
    let cd=4;const isLast=currentQuestionIndex>=shuffledGameLocations.length-1;
    const bl=isLast?'Results':'Next';
    nextQuestionBtn.textContent=`${bl} (${cd}s)`;nextQuestionBtn.style.display='inline-block';hintBtn.style.display='none';
    countdownInterval=setInterval(()=>{cd--;if(cd>0)nextQuestionBtn.textContent=`${bl} (${cd}s)`;else clearInterval(countdownInterval);},1000);
    autoNextTimer=setTimeout(()=>{if(!isLast){currentQuestionIndex++;loadQuestion();}else endGame();},4000);
}

function useHint(){
    if(!currentQuestionHintUsed){totalHintsUsed++;currentQuestionHintUsed=true;hintsRemainingElement.textContent=totalHintsUsed;}
    const loc=shuffledGameLocations[currentQuestionIndex];
    feedbackTextElement.textContent=`💡 Hint: ${maskHint(loc.hint,correctAnswerName)}`;
    feedbackTextElement.className='text-md font-medium text-amber-600';
}

function endGame(){
    stopQuestionTimer();if(autoNextTimer)clearTimeout(autoNextTimer);if(countdownInterval)clearInterval(countdownInterval);
    const te=document.getElementById('question-timer');if(te)te.remove();
    gameElapsedSec=Math.round((Date.now()-gameStartTime)/1000);
    const mins=Math.floor(gameElapsedSec/60),secs=gameElapsedSec%60;
    const timeStr=mins>0?`${mins}m ${secs}s`:`${secs}s`;
    const roundedScore=Math.round(score*10)/10,total=shuffledGameLocations.length;
    const correctCount=answerLog.filter(l=>l.correct).length;
    const accuracy=Math.round((correctCount/total)*100);
    const avgTime=answerLog.length?Math.round(answerLog.reduce((s,l)=>s+l.timeTaken,0)/answerLog.length):0;
    const prev=JSON.parse(localStorage.getItem(LS_BEST)||'null');
    const isNewBest=!prev||roundedScore>prev.score||(roundedScore===prev.score&&gameElapsedSec<prev.elapsed);
    if(isNewBest)localStorage.setItem(LS_BEST,JSON.stringify({score:roundedScore,elapsed:gameElapsedSec,date:new Date().toLocaleDateString('en-US')}));
    const bestData=JSON.parse(localStorage.getItem(LS_BEST));
    if(isDailyMode)saveDailyResult(roundedScore,gameElapsedSec);
    questionTextElement.textContent=`Game Over! Final Score: ${roundedScore} / ${total}`;
    progressArea.style.display='none';hintBtn.style.display='none';nextQuestionBtn.style.display='none';restartBtn.textContent='Restart';
    const dailyBanner=isDailyMode?`<div class="flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl px-4 py-2 text-sm font-bold">📅 Daily Challenge Complete! ${getTodayKey()}</div>`:'';
    optionsArea.innerHTML=`
      <div class="col-span-4 space-y-4">
        ${dailyBanner}
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-red-50 rounded-xl p-3 border border-red-100"><p class="text-xs text-red-400 font-semibold mb-1">Score</p><p class="text-2xl font-extrabold text-red-600">${roundedScore}<span class="text-sm font-normal text-red-400">/${total}</span></p></div>
          <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100"><p class="text-xs text-emerald-400 font-semibold mb-1">Accuracy</p><p class="text-2xl font-extrabold text-emerald-600">${accuracy}<span class="text-sm font-normal text-emerald-400">%</span></p></div>
          <div class="bg-amber-50 rounded-xl p-3 border border-amber-100"><p class="text-xs text-amber-400 font-semibold mb-1">Time</p><p class="text-lg font-extrabold text-amber-600">${timeStr}</p><p class="text-xs text-amber-400">avg ${avgTime}s/Q</p></div>
        </div>
        <div class="flex items-center justify-between bg-gradient-to-r from-red-50 to-blue-50 rounded-xl px-4 py-3 border border-red-100">
          <span class="text-sm font-bold text-red-700">🏆 Best Score</span>
          <span class="text-sm font-bold text-red-600">${bestData?`${bestData.score}pts · ${bestData.date}`:'-'}${isNewBest?'<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>':''}</span>
        </div>
        <div><p class="text-sm font-bold text-gray-600 mb-2">📊 This Game Results</p>
          <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
            ${answerLog.map(l=>`<div class="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${l.correct?'bg-green-50 border border-green-100':'bg-red-50 border border-red-100'}"><span class="${l.correct?'text-green-700':'text-red-700'} font-semibold">${l.correct?'✅':'❌'} ${l.name}</span><span class="text-gray-400">${l.timeTaken}s</span></div>`).join('')}
          </div>
        </div>
        ${renderWeakStats()}
        <div class="grid grid-cols-2 gap-2">
          <button id="btn-kakao-share" class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-3 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.627 1.638 4.938 4.125 6.3-.18.67-.657 2.43-.752 2.806-.117.46.169.454.356.33.146-.097 2.32-1.574 3.26-2.215.65.09 1.32.138 2.011.138 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/></svg>
            Kakao Share
          </button>
          <button id="btn-link-share" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            Copy Link
          </button>
        </div>
      </div>`;
    const url=window.location.href.split('?')[0];
    document.getElementById('btn-kakao-share').onclick=()=>{
        const text=`🇺🇸 US States Quiz\nScore: ${roundedScore}/${total} · Accuracy ${accuracy}% · ${timeStr}\nChallenge now! 👇\n${url}`;
        if(window.Kakao&&window.Kakao.isInitialized()){window.Kakao.Share.sendDefault({objectType:'feed',content:{title:'🇺🇸 US States Quiz Result',description:text,imageUrl:'https://isw360.github.io/k-cityquiz/korea_seoul_map.png',link:{mobileWebUrl:url,webUrl:url}},buttons:[{title:'Take the Quiz',link:{mobileWebUrl:url,webUrl:url}}]});}
        else{navigator.clipboard.writeText(text).then(()=>alert('Copied to clipboard!'));}
    };
    document.getElementById('btn-link-share').onclick=()=>{
        const text=`🇺🇸 US States Quiz\nScore: ${roundedScore}/${total} · Accuracy ${accuracy}% · ${timeStr}\nChallenge now! 👇\n${url}`;
        navigator.clipboard.writeText(text).then(()=>alert('Link copied to clipboard!'));
    };
    if(marker&&map&&map.hasLayer(marker))marker.remove();
    if(geoJsonLayer)geoJsonLayer.eachLayer(l=>geoJsonLayer.resetStyle(l));
}

function saveLocationStats(name,isCorrect){const s=JSON.parse(localStorage.getItem(LS_STATS)||'{}');if(!s[name])s[name]={correct:0,wrong:0};if(isCorrect)s[name].correct++;else s[name].wrong++;localStorage.setItem(LS_STATS,JSON.stringify(s));}
function renderWeakStats(){
    const s=JSON.parse(localStorage.getItem(LS_STATS)||'{}');
    const e=Object.entries(s).filter(([,v])=>v.wrong>0).sort((a,b)=>b[1].wrong-a[1].wrong).slice(0,5);
    if(!e.length)return'';
    const bars=e.map(([name,v])=>{const t=v.correct+v.wrong,p=Math.round((v.wrong/t)*100);return`<div><div class="flex justify-between text-xs text-gray-500 mb-0.5"><span class="font-semibold text-gray-700">${name}</span><span>${v.wrong} wrong / ${t} shown</span></div><div class="w-full bg-gray-100 rounded-full h-2"><div class="bg-red-400 h-2 rounded-full" style="width:${p}%"></div></div></div>`;}).join('');
    return`<div><p class="text-sm font-bold text-gray-600 mb-2">📉 Most Missed States (All-time)</p><div class="space-y-2">${bars}</div></div>`;
}
function maskHint(hint,name){return hint.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'),'___');}
function shuffleArray(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function generateOptions(correct){const o=[correct];const d=shuffleArray(locations.map(l=>l.name).filter(n=>n!==correct));for(let i=0;i<numOptions-1&&i<d.length;i++)o.push(d[i]);return shuffleArray(o);}

level1Btn.addEventListener('click',()=>selectDifficulty(1));
level2Btn.addEventListener('click',()=>selectDifficulty(2));
restartBtn.addEventListener('click',showDifficultyScreen);
hintBtn.addEventListener('click',useHint);
const toggleGuideBtn=document.getElementById('toggle-guide-btn');
const detailedGuide=document.getElementById('detailed-guide');
if(toggleGuideBtn&&detailedGuide){toggleGuideBtn.addEventListener('click',()=>{const h=detailedGuide.classList.contains('hidden');detailedGuide.classList.toggle('hidden',!h);toggleGuideBtn.textContent=h?'Close Guide':'Open Detailed Game Guide';});}
nextQuestionBtn.addEventListener('click',()=>{stopQuestionTimer();if(autoNextTimer)clearTimeout(autoNextTimer);if(countdownInterval)clearInterval(countdownInterval);if(currentQuestionIndex<shuffledGameLocations.length-1){currentQuestionIndex++;loadQuestion();}else endGame();});