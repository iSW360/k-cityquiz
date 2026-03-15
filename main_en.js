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

// --- Timer ---
let questionTimer = null;
let questionTimeLeft = 0;
const QUESTION_TIME_LIMIT = 10;

// --- Best score / Stats / Time ---
let gameStartTime = null;
let gameElapsedSec = 0;
let answerLog = [];
const LS_BEST  = 'kcityquiz_en_best';
const LS_STATS = 'kcityquiz_en_stats';

// --- Location Data (Korean name | English name | English hint) ---
const locations = [
    // 특별시/광역시
    { name: "서울 Seoul",       lat: 37.5665, lng: 126.9780, zoom: 9,  geoName: "서울특별시",    hint: "The capital of South Korea, home to Namsan Tower and the Han River." },
    { name: "부산 Busan",       lat: 35.1796, lng: 129.0756, zoom: 9,  geoName: "부산광역시",    hint: "A major port city famous for Haeundae Beach and Jagalchi Fish Market." },
    { name: "인천 Incheon",     lat: 37.4563, lng: 126.7052, zoom: 9,  geoName: "인천광역시",    hint: "Gateway city home to the international airport and Chinatown." },
    { name: "대구 Daegu",       lat: 35.8714, lng: 128.6014, zoom: 9,  geoName: "대구광역시",    hint: "A basin city known for Palgongsan Mountain, apples, and the textile industry." },
    { name: "광주 Gwangju",     lat: 35.1601, lng: 126.8515, zoom: 9,  geoName: "광주광역시",    hint: "Known as the 'City of Light,' with Mudeungsan Mountain and a history of democracy movements." },
    { name: "대전 Daejeon",     lat: 36.3504, lng: 127.3845, zoom: 9,  geoName: "대전광역시",    hint: "A science city famous for the Expo Science Park and the beloved Sungsimdang bakery." },
    { name: "울산 Ulsan",       lat: 35.5384, lng: 129.3114, zoom: 9,  geoName: "울산광역시",    hint: "The center of Korea's automobile and shipbuilding industries, known for Ganjeolgot sunrise." },
    { name: "세종 Sejong",      lat: 36.4801, lng: 127.2890, zoom: 10, geoName: "세종특별자치시", hint: "A planned administrative city housing the Government Complex." },

    // 경기도
    { name: "수원 Suwon",       lat: 37.2636, lng: 127.0286, zoom: 10, geoName: "수원시",  hint: "Home to Hwaseong Fortress, a UNESCO World Heritage Site." },
    { name: "성남 Seongnam",    lat: 37.4200, lng: 127.1269, zoom: 10, geoName: "성남시",  hint: "Home to Pangyo Technovalley, the heart of Korea's IT industry." },
    { name: "고양 Goyang",      lat: 37.6584, lng: 126.8320, zoom: 10, geoName: "고양시",  hint: "Known for Ilsan Lake Park and the KINTEX exhibition center." },
    { name: "용인 Yongin",      lat: 37.2410, lng: 127.1779, zoom: 10, geoName: "용인시",  hint: "A tourist city home to Everland and the Korean Folk Village." },
    { name: "부천 Bucheon",     lat: 37.4986, lng: 126.7830, zoom: 11, geoName: "부천시",  hint: "Famous for the Bucheon International Fantastic Film Festival and Comic Book Museum." },
    { name: "안산 Ansan",       lat: 37.3219, lng: 126.8309, zoom: 10, geoName: "안산시",  hint: "A west coast city known for Daebudo Island and its multicultural street." },
    { name: "안양 Anyang",      lat: 37.3943, lng: 126.9568, zoom: 11, geoName: "안양시",  hint: "Known for its Art Park and the Pyeongchon new town district." },
    { name: "평택 Pyeongtaek",  lat: 36.9923, lng: 127.1127, zoom: 10, geoName: "평택시",  hint: "Home to a major port and the world's largest semiconductor factory." },
    { name: "화성 Hwaseong",    lat: 37.1995, lng: 126.8313, zoom: 10, geoName: "화성시",  hint: "Known for the parting-sea phenomenon at Jebudo Island and dinosaur egg fossil sites." },
    { name: "남양주 Namyangju", lat: 37.6360, lng: 127.2165, zoom: 10, geoName: "남양주시", hint: "The birthplace of scholar Jeong Yak-yong (Dasan), with preserved historic sites." },
    { name: "의정부 Uijeongbu", lat: 37.7380, lng: 127.0336, zoom: 11, geoName: "의정부시", hint: "Famous for Budae-jjigae (Army Stew), influenced by the US military base culture." },
    { name: "시흥 Siheung",     lat: 37.3800, lng: 126.8029, zoom: 10, geoName: "시흥시",  hint: "Known for the Oido Red Lighthouse and Siheung Tidal Flat Eco Park." },
    { name: "파주 Paju",        lat: 37.7600, lng: 126.7799, zoom: 10, geoName: "파주시",  hint: "Home to Imjingak Peace Nuripark, the Book City, and Heyri Village." },
    { name: "김포 Gimpo",       lat: 37.6153, lng: 126.7157, zoom: 10, geoName: "김포시",  hint: "Home to Gimpo International Airport and the Hangang New Town." },
    { name: "광명 Gwangmyeong", lat: 37.4786, lng: 126.8650, zoom: 11, geoName: "광명시",  hint: "Famous for a theme park built inside a repurposed mine cave." },
    { name: "군포 Gunpo",       lat: 37.3616, lng: 126.9350, zoom: 11, geoName: "군포시",  hint: "Known for Surisan Mountain and its beautiful azalea festival." },
    { name: "광주 Gwangju(GG)", lat: 37.4292, lng: 127.2550, zoom: 10, geoName: "광주시",  hint: "Home to Namhansanseong Fortress and historic Joseon porcelain kilns." },
    { name: "이천 Icheon",      lat: 37.2799, lng: 127.4340, zoom: 10, geoName: "이천시",  hint: "Renowned for its ceramics festival and premium 'Royal' rice." },
    { name: "양주 Yangju",      lat: 37.7853, lng: 127.0458, zoom: 10, geoName: "양주시",  hint: "Home to Jang Wook-jin Art Museum and the traditional Byeolsandae mask dance." },
    { name: "오산 Osan",        lat: 37.1499, lng: 127.0776, zoom: 11, geoName: "오산시",  hint: "Known for Mulhyangi Arboretum and the historic Doksan Fortress." },
    { name: "구리 Guri",        lat: 37.5939, lng: 127.1406, zoom: 11, geoName: "구리시",  hint: "Famous for Donggureung (a cluster of Joseon royal tombs) and Han River Park." },
    { name: "안성 Anseong",     lat: 37.0080, lng: 127.2797, zoom: 10, geoName: "안성시",  hint: "Known for its brassware, Anseong-gukbap (rice soup), and the Namsadang troupe." },
    { name: "포천 Pocheon",     lat: 37.8949, lng: 127.2000, zoom: 10, geoName: "포천시",  hint: "A popular tourist destination known for Idong Galbi (ribs), makgeolli, and Sanjeong Lake." },
    { name: "의왕 Uiwang",      lat: 37.3448, lng: 126.9688, zoom: 11, geoName: "의왕시",  hint: "Known for Baegwun Lake and the Wang-song Lake Rail Bike." },
    { name: "하남 Hanam",       lat: 37.5393, lng: 127.2147, zoom: 11, geoName: "하남시",  hint: "Famous for Starfield Hanam shopping mall and Geomdan Mountain hiking trails." },
    { name: "여주 Yeoju",       lat: 37.2983, lng: 127.6370, zoom: 10, geoName: "여주시",  hint: "Home to King Sejong's royal tomb (Yeongneung) and a premium outlet mall." },
    { name: "동두천 Dongducheon",lat: 37.9036, lng: 127.0576, zoom: 11, geoName: "동두천시", hint: "Known for Soyo Mountain and Bosan-dong Tourist Zone, shaped by US military culture." },
    { name: "과천 Gwacheon",    lat: 37.4292, lng: 126.9878, zoom: 11, geoName: "과천시",  hint: "Home to Seoul Grand Park, the National Museum of Modern Art, and Seoul Racecourse Park." },

    // 강원도
    { name: "춘천 Chuncheon",   lat: 37.8813, lng: 127.7298, zoom: 10, geoName: "춘천시",  hint: "The 'City of Lakes,' famous for Dakgalbi (spicy chicken), Makguksu, and Nami Island." },
    { name: "원주 Wonju",       lat: 37.3425, lng: 127.9202, zoom: 10, geoName: "원주시",  hint: "Known for Chiaksan Mountain, the Korean paper (Hanji) culture, and Sogeum Mountain suspension bridge." },
    { name: "강릉 Gangneung",   lat: 37.7519, lng: 128.8761, zoom: 10, geoName: "강릉시",  hint: "Famous for Gyeongpodae Beach, Coffee Street, and Choddang tofu." },
    { name: "동해 Donghae",     lat: 37.5217, lng: 129.1139, zoom: 10, geoName: "동해시",  hint: "Home to the scenic Mureung Valley and the beautiful Chuam Candlestick Rock sunrise." },
    { name: "속초 Sokcho",      lat: 38.2070, lng: 128.5918, zoom: 10, geoName: "속초시",  hint: "Known for Seoraksan Mountain, Abai Village, and famous spicy fried chicken." },
    { name: "삼척 Samcheok",    lat: 37.4498, lng: 129.1653, zoom: 10, geoName: "삼척시",  hint: "Known for Hwanseon Cave, the Daeri Cave district, and Jangho fishing village." },
    { name: "태백 Taebaek",     lat: 37.1656, lng: 128.9856, zoom: 10, geoName: "태백시",  hint: "Famous for its Snow Festival and history as the center of Korea's coal industry." },

    // 충청북도
    { name: "청주 Cheongju",    lat: 36.6424, lng: 127.4891, zoom: 10, geoName: "청주시",  hint: "The home of Jikji, the world's oldest surviving book printed with movable metal type." },
    { name: "충주 Chungju",     lat: 36.9712, lng: 127.9299, zoom: 10, geoName: "충주시",  hint: "Known for Chungju Lake, Tangeumdae park, and its famously sweet apples." },
    { name: "제천 Jecheon",     lat: 37.1325, lng: 128.1922, zoom: 10, geoName: "제천시",  hint: "Known for Euirimji reservoir, the scenic Cheongpungmyeongwol area, and herbal medicine." },

    // 충청남도
    { name: "천안 Cheonan",     lat: 36.8151, lng: 127.1139, zoom: 10, geoName: "천안시",  hint: "Home to the Independence Hall of Korea, the Yu Gwan-sun memorial site, and walnut cake." },
    { name: "공주 Gongju",      lat: 36.4525, lng: 127.1200, zoom: 10, geoName: "공주시",  hint: "An ancient Baekje capital, famous for Muryeong Royal Tomb and Gongsanseong Fortress." },
    { name: "보령 Boryeong",    lat: 36.3334, lng: 126.6102, zoom: 10, geoName: "보령시",  hint: "Famous for Daecheon Beach and the world-renowned Boryeong Mud Festival." },
    { name: "아산 Asan",        lat: 36.7898, lng: 127.0020, zoom: 10, geoName: "아산시",  hint: "Home to Hyeonchungsa Shrine, Oeam Folk Village, and Onyang Hot Springs." },
    { name: "서산 Seosan",      lat: 36.7800, lng: 126.4500, zoom: 10, geoName: "서산시",  hint: "Famous for the Seosan Maae Samjon Buddha and Ganwoldo oyster-stuffed kimchi." },
    { name: "논산 Nonsan",      lat: 36.1868, lng: 127.0847, zoom: 10, geoName: "논산시",  hint: "Home to the Army Training Center and famous for its sweet winter strawberries." },
    { name: "계룡 Gyeryong",    lat: 36.2741, lng: 127.2492, zoom: 11, geoName: "계룡시",  hint: "A national defense city housing the headquarters of Korea's Army, Navy, and Air Force." },
    { name: "당진 Dangjin",     lat: 36.8933, lng: 126.6300, zoom: 10, geoName: "당진시",  hint: "Known for Seohae Bridge, Waemok Village sunrise, and its steel industry." },

    // 전라북도
    { name: "전주 Jeonju",      lat: 35.8242, lng: 127.1480, zoom: 10, geoName: "전주시",  hint: "World-famous for its Bibimbap and Hanok (traditional Korean house) village." },
    { name: "군산 Gunsan",      lat: 35.9700, lng: 126.7100, zoom: 10, geoName: "군산시",  hint: "Known for the Modern History Museum, Seonyu Island, and the famous Isungdang bakery." },
    { name: "익산 Iksan",       lat: 35.9461, lng: 126.9578, zoom: 10, geoName: "익산시",  hint: "Home to Mireuksa Temple Site Stone Pagoda, built by the dream of Baekje King Mu." },
    { name: "정읍 Jeongeup",    lat: 35.5700, lng: 126.8500, zoom: 10, geoName: "정읍시",  hint: "Home to Naejangsan National Park, renowned for its spectacular autumn foliage." },
    { name: "남원 Namwon",      lat: 35.4000, lng: 127.3800, zoom: 10, geoName: "남원시",  hint: "Famous for Gwanghallu Garden, the setting of the classic love story of Chunhyang." },
    { name: "김제 Gimje",       lat: 35.8000, lng: 126.8800, zoom: 10, geoName: "김제시",  hint: "The only place in Korea where you can see a true flat horizon, site of the ancient Byeokgolje reservoir." },

    // 전라남도
    { name: "목포 Mokpo",       lat: 34.8119, lng: 126.3917, zoom: 10, geoName: "목포시",  hint: "A port city known for Yudalsan Mountain, Mokpo Harbor, and three-legged raw octopus." },
    { name: "여수 Yeosu",       lat: 34.7604, lng: 127.6622, zoom: 10, geoName: "여수시",  hint: "Famous for its beautiful night sea, Dolsan Gat Kimchi, and Expo Ocean Park." },
    { name: "순천 Suncheon",    lat: 34.9500, lng: 127.4800, zoom: 10, geoName: "순천시",  hint: "An eco city known for Suncheonman National Garden and its beautiful reed marshland." },
    { name: "나주 Naju",        lat: 35.0100, lng: 126.7100, zoom: 10, geoName: "나주시",  hint: "Famous for its sweet and crisp Naju pears and Naju Gomtang (beef bone soup)." },
    { name: "광양 Gwangyang",   lat: 34.9400, lng: 127.6900, zoom: 10, geoName: "광양시",  hint: "Known for its steel plant, plum blossom festival, and Gwangyang bulgogi." },

    // 경상북도
    { name: "포항 Pohang",      lat: 36.0190, lng: 129.3435, zoom: 10, geoName: "포항시",  hint: "Famous for Homigot Sunrise Park (the 'Hand of Sunrise'), POSCO steel, and Gwamegi (dried fish)." },
    { name: "구미 Gumi",        lat: 36.1190, lng: 128.3445, zoom: 10, geoName: "구미시",  hint: "Home to Geumosan National Park and a major electronics industrial complex." },
    { name: "경주 Gyeongju",    lat: 35.8562, lng: 129.2240, zoom: 10, geoName: "경주시",  hint: "The ancient capital of the Silla Kingdom for 1,000 years, home to Bulguksa, Seokguram, and Cheomseongdae." },
    { name: "안동 Andong",      lat: 36.5600, lng: 128.7200, zoom: 10, geoName: "안동시",  hint: "Home to Hahoe Village, Andong Jjimdak (braised chicken), dried mackerel, and Andong soju." },
    { name: "김천 Gimcheon",    lat: 36.1300, lng: 128.1100, zoom: 10, geoName: "김천시",  hint: "Known for Jikjisa Temple, an innovation city, and famously sweet plums." },
    { name: "영주 Yeongju",     lat: 36.8000, lng: 128.6300, zoom: 10, geoName: "영주시",  hint: "Famous for Buseoksa Temple, Sosu Confucian Academy, and Punggi ginseng." },
    { name: "상주 Sangju",      lat: 36.4100, lng: 128.1600, zoom: 10, geoName: "상주시",  hint: "The 'City of Three Whites' (rice, silk, and dried persimmons), nationally famous for its Gotgam." },
    { name: "영천 Yeongcheon",  lat: 35.9700, lng: 128.9300, zoom: 10, geoName: "영천시",  hint: "Home to Bohyunsan Observatory, famous for grapes and a large herbal medicine market." },
    { name: "문경 Mungyeong",   lat: 36.5900, lng: 128.1900, zoom: 10, geoName: "문경시",  hint: "Known for the historic Mungyeongsaejae Pass, omija berries, and ceramics." },
    { name: "경산 Gyeongsan",   lat: 35.8200, lng: 128.7300, zoom: 10, geoName: "경산시",  hint: "A city dense with universities, and the top producer of jujubes in Korea." },

    // 경상남도
    { name: "창원 Changwon",    lat: 35.2280, lng: 128.6811, zoom: 10, geoName: "창원시",  hint: "A planned city famous for Jinhae's cherry blossom festival and Machang Bridge." },
    { name: "김해 Gimhae",      lat: 35.2326, lng: 128.8800, zoom: 10, geoName: "김해시",  hint: "The heartland of the Gaya Kingdom, home to King Suro's tomb and Bonghama Village." },
    { name: "진주 Jinju",       lat: 35.1800, lng: 128.0800, zoom: 10, geoName: "진주시",  hint: "Famous for Jinjuseong Fortress's Chokseongnu Pavilion and the beautiful autumn Yudeung lantern festival." },
    { name: "통영 Tongyeong",   lat: 34.8400, lng: 128.4300, zoom: 10, geoName: "통영시",  hint: "A port city famous for Dongpirang Mural Village, Chungmu Gimbap, and honey bread." },
    { name: "사천 Sacheon",     lat: 35.0800, lng: 128.0600, zoom: 10, geoName: "사천시",  hint: "Known for its scenic ocean cable car and the aerospace industry." },
    { name: "밀양 Miryang",     lat: 35.5000, lng: 128.7400, zoom: 10, geoName: "밀양시",  hint: "The hometown of the Miryang Arirang folk song, famous for Yeongnamnu Pavilion and the Eomgol ice valley." },
    { name: "거제 Geoje",       lat: 34.8800, lng: 128.6200, zoom: 10, geoName: "거제시",  hint: "Home to Wind Hill (Baramaneonik), Oedo Botania island, and a major shipbuilding industry." },
    { name: "양산 Yangsan",     lat: 35.3300, lng: 129.0300, zoom: 10, geoName: "양산시",  hint: "A mountain tourism city known for Tongdosa Temple and Naewonsa Valley." },

    // 제주
    { name: "제주 Jeju",        lat: 33.4996, lng: 126.5312, zoom: 9, geoName: "제주시",   hint: "A world-class tourist destination with Yongduam Rock, the international airport, and Hallasan Mountain." },
    { name: "서귀포 Seogwipo",  lat: 33.2543, lng: 126.5600, zoom: 9, geoName: "서귀포시",  hint: "The southern city of Jeju, famous for Cheonjiyeon Waterfall, Seongsan Ilchulbong, and tangerines." },

    // 주요 군
    { name: "강화 Ganghwa",     lat: 37.7479, lng: 126.4872, zoom: 10, geoName: "강화군",  hint: "A historic island with dolmen UNESCO sites, Jeondeungsa Temple, and famous ginseng." },
    { name: "옹진 Ongjin",      lat: 37.4475, lng: 126.1408, zoom: 9,  geoName: "옹진군",  hint: "Made up of Korea's westernmost islands including Baengnyeongdo and Yeonpyeongdo." },
    { name: "가평 Gapyeong",    lat: 37.8318, lng: 127.5096, zoom: 10, geoName: "가평군",  hint: "Known for its pine nuts (jat), and popular for Achim Goyohm Arboretum and pension villages." },
    { name: "양평 Yangpyeong",  lat: 37.4916, lng: 127.4879, zoom: 10, geoName: "양평군",  hint: "A serene countryside city known for Dumulmeori (confluence of two rivers) and Yongmunsa Temple's ginkgo tree." },
    { name: "연천 Yeoncheon",   lat: 38.0964, lng: 127.0744, zoom: 10, geoName: "연천군",  hint: "A frontline border area with Paleolithic heritage sites and the Taepung Observatory." },
    { name: "고성 Goseong(GW)", lat: 38.3804, lng: 128.4678, zoom: 10, geoName: "고성군",  hint: "An east coast county with the Unification Observatory, the gateway to Geumgangsan Mountain." },
    { name: "양구 Yanggu",      lat: 38.1093, lng: 127.9893, zoom: 10, geoName: "양구군",  hint: "Located at the geographical center of the Korean Peninsula." },
    { name: "양양 Yangyang",    lat: 38.0763, lng: 128.6219, zoom: 10, geoName: "양양군",  hint: "Known for pine mushrooms (songyi), Naksansa Temple, and a rising surfing destination." },
    { name: "영월 Yeongwol",    lat: 37.1866, lng: 128.4633, zoom: 10, geoName: "영월군",  hint: "The exile site of King Danjong, famous for Cheongnyeongpo and Byeolmaro Observatory." },
    { name: "인제 Inje",        lat: 38.0691, lng: 128.1704, zoom: 10, geoName: "인제군",  hint: "A mountainous area known for dried pollack (hwangtae), river rafting, and Inje Speedium." },
    { name: "정선 Jeongseon",   lat: 37.3822, lng: 128.6607, zoom: 10, geoName: "정선군",  hint: "Known for Jeongseon Arirang folk song, the traditional 5-day market, and Kangwon Land Casino." },
    { name: "철원 Cheorwon",    lat: 38.1468, lng: 127.3134, zoom: 10, geoName: "철원군",  hint: "A historic battle site known for Goseokcheong valley, the Labor Party building, and premium Cheorwon rice." },
    { name: "평창 Pyeongchang", lat: 37.3705, lng: 128.3916, zoom: 10, geoName: "평창군",  hint: "The host of the 2018 Winter Olympics, famous for the beautiful Daegwallyeong sheep farm." },
    { name: "홍천 Hongcheon",   lat: 37.6900, lng: 127.8853, zoom: 10, geoName: "홍천군",  hint: "A vast county known for its beef cattle, corn, and Sutasa Temple." },
    { name: "화천 Hwacheon",    lat: 38.1065, lng: 127.7082, zoom: 10, geoName: "화천군",  hint: "A border area nationally famous for its winter Sancheoneo (mountain trout) festival." },
    { name: "괴산 Goesan",      lat: 36.8152, lng: 127.7863, zoom: 10, geoName: "괴산군",  hint: "Known for the scenic Sanmagi old trail and clean Goesan chili peppers." },
    { name: "단양 Danyang",     lat: 36.9840, lng: 128.3659, zoom: 10, geoName: "단양군",  hint: "Famous for the Eight Scenic Views of Danyang, Mancheonha Skywalk, and garlic." },
    { name: "보은 Boeun",       lat: 36.4883, lng: 127.7294, zoom: 10, geoName: "보은군",  hint: "Home to Beopjusa Temple, the Jeongipum pine tree, and high-quality jujubes." },
    { name: "영동 Yeongdong",   lat: 36.1746, lng: 127.7786, zoom: 10, geoName: "영동군",  hint: "Known for its grape and wine industry, and the Nangye Traditional Music Festival." },
    { name: "옥천 Okcheon",     lat: 36.3057, lng: 127.5727, zoom: 10, geoName: "옥천군",  hint: "The birthplace of poet Jeong Ji-yong, famous for the scenic Busodam cliff." },
    { name: "음성 Eumseong",    lat: 36.9383, lng: 127.6896, zoom: 10, geoName: "음성군",  hint: "Known for its clean chili peppers and the birthplace of former UN Secretary-General Ban Ki-moon." },
    { name: "증평 Jeungpyeong", lat: 36.7844, lng: 127.5824, zoom: 10, geoName: "증평군",  hint: "A small but strong county famous for Jwagusa Forest Resort and the Edufarm special zone." },
    { name: "진천 Jincheon",    lat: 36.8562, lng: 127.4422, zoom: 10, geoName: "진천군",  hint: "Famous for the ancient Nongdari Bridge and premium Saenggeojincheon rice, home to the National Training Center." },
    { name: "금산 Geumsan",     lat: 36.1037, lng: 127.4891, zoom: 10, geoName: "금산군",  hint: "The hub of Korea's ginseng trade, hosting the famous Ginseng Festival." },
    { name: "부여 Buyeo",       lat: 36.2795, lng: 126.9122, zoom: 10, geoName: "부여군",  hint: "The last capital of the Baekje Kingdom, famous for Nakhwaam Rock and Jeongnimsaji Five-story Stone Pagoda." },
    { name: "서천 Seocheon",    lat: 36.0792, lng: 126.6908, zoom: 10, geoName: "서천군",  hint: "A west coast hometown known for Hansan ramie fabric, Sogok wine, and the National Ecology Institute." },
    { name: "예산 Yesan",       lat: 36.6801, lng: 126.8451, zoom: 10, geoName: "예산군",  hint: "Known for Yedan Lake suspension bridge, Deoksan Hot Springs, and Yesan apples." },
    { name: "청양 Cheongyang",  lat: 36.4022, lng: 126.8013, zoom: 10, geoName: "청양군",  hint: "Famous for Chilgapsan Mountain, fiery Cheongyang chili peppers, and wolfberries." },
    { name: "태안 Taean",       lat: 36.7533, lng: 126.2995, zoom: 10, geoName: "태안군",  hint: "Home to Anmyeondo Beach, a flower festival, and the Taean Haean National Park." },
    { name: "홍성 Hongseong",   lat: 36.5984, lng: 126.6631, zoom: 10, geoName: "홍성군",  hint: "Known for its beef cattle and the Namdanghang baby clam festival. The seat of Chungnam provincial government." },
    { name: "고창 Gochang",     lat: 35.4357, lng: 126.7027, zoom: 10, geoName: "고창군",  hint: "Home to Gochang Eupseong Fortress, dolmen UNESCO sites, bokbunja wine, and Pungcheon eel." },
    { name: "무주 Muju",        lat: 36.0076, lng: 127.6601, zoom: 10, geoName: "무주군",  hint: "A pristine area with a ski resort at Deogyusan Mountain and the famous Firefly Festival." },
    { name: "부안 Buan",        lat: 35.7323, lng: 126.7320, zoom: 10, geoName: "부안군",  hint: "Known for Chaeseokgang Cliff, Byeonsanbando National Park, and Naesosa Temple." },
    { name: "순창 Sunchang",    lat: 35.3748, lng: 127.1408, zoom: 10, geoName: "순창군",  hint: "Famous for Gangsansan Valley and the traditional fermented red pepper paste (gochujang) folk village." },
    { name: "완주 Wanju",       lat: 35.9149, lng: 127.2456, zoom: 10, geoName: "완주군",  hint: "Surrounds Jeonju city, home to Daedunsan Mountain and Samrye Cultural Arts Village." },
    { name: "임실 Imsil",       lat: 35.6190, lng: 127.2842, zoom: 10, geoName: "임실군",  hint: "The birthplace of Korea's cheese industry, famous for Imsil Cheese Village." },
    { name: "장수 Jangsu",      lat: 35.6476, lng: 127.5215, zoom: 10, geoName: "장수군",  hint: "A highland county known as the birthplace of martyr Nongae, famous for apples and beef." },
    { name: "진안 Jinan",       lat: 35.7925, lng: 127.4288, zoom: 10, geoName: "진안군",  hint: "Famous for Maisan Mountain (shaped like horse ears) and red ginseng (hongsam)." },
    { name: "강진 Gangjin",     lat: 34.6401, lng: 126.7695, zoom: 10, geoName: "강진군",  hint: "A historic hometown with Dasan Chodang retreat and the Goryeo Celadon Museum." },
    { name: "고흥 Goheung",     lat: 34.6069, lng: 127.2757, zoom: 10, geoName: "고흥군",  hint: "Home to the Naro Space Center, yuzu citrus, and Palgyeongsan National Park." },
    { name: "곡성 Gokseong",    lat: 35.2825, lng: 127.2917, zoom: 10, geoName: "곡성군",  hint: "Known for the Seomjingang Train Village, a rose festival, and melons." },
    { name: "구례 Gurye",       lat: 35.2057, lng: 127.4628, zoom: 10, geoName: "구례군",  hint: "Home to Jirisan Nogodan Peak, the cornus (sansuyu) festival, and Hwaeomsa Temple." },
    { name: "담양 Damyang",     lat: 35.3217, lng: 126.9850, zoom: 10, geoName: "담양군",  hint: "Famous for the Metasequoia tree-lined road and the bamboo forest at Juknokwon." },
    { name: "보성 Boseong",     lat: 34.7712, lng: 127.0811, zoom: 10, geoName: "보성군",  hint: "A hometown famous for its endless rolling green tea fields and Beolgyo cockles (kkomak)." },
    { name: "신안 Sinan",       lat: 34.8322, lng: 126.1193, zoom: 9,  geoName: "신안군",  hint: "Composed of 1,004 islands, famously known for its premium sea salt (cheonillyeom)." },
    { name: "영광 Yeonggwang",  lat: 35.2778, lng: 126.5132, zoom: 10, geoName: "영광군",  hint: "Known for the Baegsuhaeando coastal road and the beloved Beopseongpo dried yellow croaker (gulbi)." },
    { name: "완도 Wando",       lat: 34.3100, lng: 126.7578, zoom: 10, geoName: "완도군",  hint: "Historically linked to maritime hero Jang Bogo, and the nation's top abalone producer." },
    { name: "해남 Haenam",      lat: 34.5739, lng: 126.5986, zoom: 10, geoName: "해남군",  hint: "Home to Ttangkkeutmaeul (Land's End Village), the southernmost tip of the Korean mainland, and Daeheungsa Temple." },
    { name: "고령 Goryeong",    lat: 35.7289, lng: 128.2619, zoom: 10, geoName: "고령군",  hint: "The ancient capital of the Daegaya Kingdom, famous for the Daegaya Museum and burial mounds." },
    { name: "봉화 Bonghwa",     lat: 36.8929, lng: 128.7360, zoom: 10, geoName: "봉화군",  hint: "A remote village known for Cheongnyangsan Mountain, forest pine mushrooms, and Buncheon Station's Santa Village." },
    { name: "성주 Seongju",     lat: 35.9198, lng: 128.2839, zoom: 10, geoName: "성주군",  hint: "Nationally famous for its sweet and crispy Korean melon (chamoe)." },
    { name: "영덕 Yeongdeok",   lat: 36.4136, lng: 129.3653, zoom: 10, geoName: "영덕군",  hint: "Home to Ganggu Port, nationally renowned for the finest snow crab (daege)." },
    { name: "울릉 Ulleung",     lat: 37.4851, lng: 130.9056, zoom: 10, geoName: "울릉군",  hint: "A gem island in the East Sea, famous for pumpkin candy (hobakyet) and squid." },
    { name: "울진 Uljin",       lat: 36.9946, lng: 129.4022, zoom: 10, geoName: "울진군",  hint: "Known for Buryeong Valley, Baegam Hot Springs, snow crab, and pine mushrooms." },
    { name: "의성 Uiseong",     lat: 36.3533, lng: 128.6983, zoom: 10, geoName: "의성군",  hint: "The first city that comes to mind for garlic in Korea, nationally famous for its garlic." },
    { name: "청도 Cheongdo",    lat: 35.6473, lng: 128.7344, zoom: 10, geoName: "청도군",  hint: "Famous for the Cheongdo Bullfighting Festival and the seedless persimmon (bansi)." },
    { name: "청송 Cheongsong",  lat: 36.4353, lng: 129.0583, zoom: 10, geoName: "청송군",  hint: "Home to Juwangsan National Park, Jusanji pond, and famously delicious apples." },
    { name: "거창 Geochang",    lat: 35.6874, lng: 127.9096, zoom: 10, geoName: "거창군",  hint: "Known for Suseungdae Valley and Geochang apples in the western Gyeongnam region." },
    { name: "고성 Goseong(GN)", lat: 34.9758, lng: 128.3241, zoom: 10, geoName: "고성군",  hint: "Famous for dinosaur footprint fossil sites and Danghangpo tourist complex." },
    { name: "남해 Namhae",      lat: 34.8361, lng: 127.8922, zoom: 10, geoName: "남해군",  hint: "Known for the German Village, beautiful terrace rice paddies (daengi-non), and Sangju Silver Sand Beach." },
    { name: "창녕 Changnyeong", lat: 35.5458, lng: 128.4913, zoom: 10, geoName: "창녕군",  hint: "Nationally famous for Upo Wetland and Bugok Hot Springs." },
    { name: "하동 Hadong",      lat: 35.0673, lng: 127.7516, zoom: 10, geoName: "하동군",  hint: "Known for Hwagae Market, Choe Champandaek House, and wild green tea." },
    { name: "합천 Hapcheon",    lat: 35.5667, lng: 128.1658, zoom: 10, geoName: "합천군",  hint: "Home to Haeinsa Temple with the Tripitaka Koreana, Hwangmaesan azaleas, and a film theme park." }
];

let shuffledGameLocations = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswerName = '';
let numOptions = 4;
const MAX_QUESTIONS_PER_GAME = 10;
const PROVINCE_VIEW_ZOOM = 6;
const CITY_VIEW_DELAY = 1500;

const provinceHueMap = {
    '서울': 210, '부산': 10, '대구': 30, '인천': 270,
    '광주': 160, '대전': 340, '울산': 20, '세종': 200,
    '경기': 180, '강원': 120, '충북': 300, '충남': 320,
    '전북': 60, '전남': 90, '경북': 0, '경남': 50, '제주': 240
};

function getProvinceFromCode(code) {
    const prefix = code.substring(0, 2);
    const map = {
        '11':'서울','21':'부산','22':'대구','23':'인천','24':'광주','25':'대전',
        '26':'울산','29':'세종','31':'경기','32':'강원특별자치도','33':'충북',
        '34':'충남','35':'전북특별자치도','36':'전남','37':'경북','38':'경남','39':'제주'
    };
    return map[prefix] || '기타';
}

function getColorForRegion(name, code) {
    const province = getProvinceFromCode(code);
    const hue = provinceHueMap[province.substring(0, 2)] || 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return `hsl(${hue}, 60%, ${40 + (hash % 30)}%)`;
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
            <div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-indigo-500" style="width:100%"></div>
        </div>
        <span id="timer-text" class="text-sm font-bold text-indigo-600 min-w-[2.5rem] text-right">${QUESTION_TIME_LIMIT}s</span>
    `;
    const questionArea = document.getElementById('question-area');
    questionArea.parentNode.insertBefore(timerEl, questionArea);
}

function startQuestionTimer() {
    if (questionTimer) clearInterval(questionTimer);
    questionTimeLeft = QUESTION_TIME_LIMIT;
    createTimerUI();
    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');
    questionTimer = setInterval(() => {
        questionTimeLeft--;
        const pct = (questionTimeLeft / QUESTION_TIME_LIMIT) * 100;
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

function stopQuestionTimer() {
    if (questionTimer) { clearInterval(questionTimer); questionTimer = null; }
}

function handleTimeOut() {
    stopQuestionTimer();
    answerLog.push({ name: correctAnswerName, correct: false, timeTaken: QUESTION_TIME_LIMIT });
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
    const btnLabel = (currentQuestionIndex < shuffledGameLocations.length - 1) ? 'Next (3s)' : 'Results (3s)';
    nextQuestionBtn.textContent = btnLabel;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';
    let countdown = 3;
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = (currentQuestionIndex < shuffledGameLocations.length - 1) ? `Next (${countdown}s)` : `Results (${countdown}s)`;
        else clearInterval(countdownInterval);
    }, 1000);
    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) moveToNextQuestion();
        else endGame();
    }, 3000);
}

// =============================================
async function initMap() {
    mapErrorInfo.textContent = 'Loading map data...';
    if (map) map.remove();
    map = L.map('map').setView([36.5, 127.5], 7);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd', maxZoom: 19
    }).addTo(map);
    const geoJsonUrl = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json';
    try {
        const response = await fetch(geoJsonUrl);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const data = await response.json();
        if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
        geoJsonLayer = L.geoJSON(data, {
            style: f => {
                const color = getColorForRegion(f.properties.name || '', f.properties.code || '');
                return { color, weight: 1.2, opacity: 0.7, fillOpacity: 0.3, fillColor: color };
            },
            onEachFeature: (f, layer) => {
                layer.on({
                    mouseover: e => { e.target.setStyle({ weight: 3, fillOpacity: 0.4 }); if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) e.target.bringToFront(); },
                    mouseout:  e => geoJsonLayer && geoJsonLayer.resetStyle(e.target)
                });
            }
        }).addTo(map);
        mapErrorInfo.textContent = '';
    } catch (e) {
        mapErrorInfo.textContent = 'Failed to load district boundary data.';
    }
    marker = L.marker([0, 0], {
        icon: L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png', shadowSize: [41, 41]
        })
    });
}

function highlightCurrentQuestionRegion(questionGeoName) {
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(layer => {
            const fn = layer.feature.properties.name || '';
            if (fn.startsWith(questionGeoName)) {
                layer.setStyle({ weight: 4, color: '#c00', fillOpacity: 0.6, fillColor: '#ffeb3b' });
                if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) layer.bringToFront();
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
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();
    quizContainer.style.display = 'none';
    difficultySelector.style.display = 'block';
    questionTextElement.textContent = 'Press a level button to start!';
    progressArea.style.display = 'none';
    feedbackTextElement.textContent = '';
    optionsArea.innerHTML = '';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'none';
}

async function startGame() {
    score = 0; currentQuestionIndex = 0; totalHintsUsed = 0;
    currentQuestionHintUsed = false;
    hintsRemainingElement.textContent = 0;
    gameStartTime = Date.now(); gameElapsedSec = 0; answerLog = [];
    shuffledGameLocations = shuffleArray([...locations]).slice(0, MAX_QUESTIONS_PER_GAME);
    totalQuestionsElement.textContent = shuffledGameLocations.length;
    progressArea.style.display = 'block';
    questionTextElement.textContent = "Loading map... please wait.";
    restartBtn.disabled = true;
    if (!map) {
        try { await initMap(); }
        catch (e) { mapErrorInfo.textContent = "Map initialization failed."; restartBtn.disabled = false; return; }
    } else {
        if (marker && map.hasLayer(marker)) marker.remove();
        if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    }
    restartBtn.disabled = false;
    restartBtn.textContent = 'Restart';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'inline-flex';
    hintBtn.disabled = false;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    if (map) loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= shuffledGameLocations.length) { endGame(); return; }
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const loc = shuffledGameLocations[currentQuestionIndex];
    correctAnswerName = loc.name;
    currentQuestionHintUsed = false;
    questionTimeLeft = QUESTION_TIME_LIMIT;
    questionTextElement.textContent = "Which region is highlighted in red?";
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    if (geoJsonLayer) geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    if (loc.geoName) highlightCurrentQuestionRegion(loc.geoName);
    const latLng = [loc.lat, loc.lng];
    if (marker) marker.setLatLng(latLng).addTo(map);
    else marker = L.marker(latLng).addTo(map);
    map.setView(latLng, PROVINCE_VIEW_ZOOM);
    setTimeout(() => {
        if (map) map.flyTo(latLng, Math.max((loc.zoom || 10) - 3, PROVINCE_VIEW_ZOOM - 1), { duration: 1 });
    }, CITY_VIEW_DELAY);
    optionsArea.innerHTML = '';
    generateOptions(correctAnswerName).forEach(optName => {
        const btn = document.createElement('button');
        btn.dataset.key = optName;
        btn.className = "option-button w-full bg-white hover:bg-indigo-100 text-indigo-700 py-1 px-2 border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex flex-col items-center justify-center leading-tight";

        // "서울 Seoul" → 한글 위, 영어 아래 두 줄로 표시
        const spaceIdx = optName.indexOf(' ');
        if (spaceIdx !== -1) {
            const korean = optName.substring(0, spaceIdx);
            const english = optName.substring(spaceIdx + 1);
            btn.innerHTML = `<span class="text-xs sm:text-sm font-bold">${korean}</span><span class="text-[10px] sm:text-xs font-medium text-indigo-400">${english}</span>`;
        } else {
            btn.innerHTML = `<span class="text-xs sm:text-sm font-bold">${optName}</span>`;
        }

        btn.onclick = () => handleAnswer(optName, btn);
        optionsArea.appendChild(btn);
    });
    feedbackTextElement.textContent = '';
    feedbackTextElement.className = 'text-md sm:text-lg font-medium';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'inline-flex';
    setTimeout(() => startQuestionTimer(), CITY_VIEW_DELAY + 1000);
}

function handleAnswer(selectedName, buttonElement) {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.remove('hover:bg-indigo-100');
        btn.classList.add('opacity-70', 'cursor-not-allowed');
    });
    const loc = shuffledGameLocations[currentQuestionIndex];
    const isCorrect = selectedName === correctAnswerName;
    const timeTaken = QUESTION_TIME_LIMIT - questionTimeLeft;
    answerLog.push({ name: correctAnswerName, correct: isCorrect, timeTaken });
    saveLocationStats(correctAnswerName, isCorrect);
    const timeBonus = questionTimeLeft > 0 ? (questionTimeLeft / QUESTION_TIME_LIMIT) : 0;
    if (isCorrect) {
        let gained = currentQuestionHintUsed ? 0.5 : Math.round((0.5 + timeBonus * 0.5) * 10) / 10;
        score += gained;
        const timeMsg = currentQuestionHintUsed ? '' : ' ⚡ Speed bonus!';
        feedbackTextElement.innerHTML = `<span class="text-green-600 font-bold">Correct! 🎉 (+${gained}pt)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300');
        buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        feedbackTextElement.innerHTML = `<span class="text-red-600 font-bold">Wrong! The answer was <strong>${correctAnswerName}</strong>. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(loc.hint, correctAnswerName)}</span>`;
        buttonElement.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300');
        buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-700');
        Array.from(optionsArea.children).forEach(btn => {
            if (btn.dataset.key === correctAnswerName) {
                btn.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300', 'opacity-70');
                btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
            }
        });
    }
    let countdown = 4;
    const btnLabel = (currentQuestionIndex < shuffledGameLocations.length - 1) ? 'Next' : 'Results';
    nextQuestionBtn.textContent = `${btnLabel} (${countdown}s)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) nextQuestionBtn.textContent = `${btnLabel} (${countdown}s)`;
        else clearInterval(countdownInterval);
    }, 1000);
    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) moveToNextQuestion();
        else endGame();
    }, 4000);
}

function useHint() {
    if (!currentQuestionHintUsed) {
        totalHintsUsed++;
        currentQuestionHintUsed = true;
        hintsRemainingElement.textContent = totalHintsUsed;
    }
    const loc = shuffledGameLocations[currentQuestionIndex];
    feedbackTextElement.textContent = `💡 Hint: ${maskHint(loc.hint, correctAnswerName)}`;
    feedbackTextElement.className = 'text-md font-medium text-amber-600';
}

function moveToNextQuestion() { currentQuestionIndex++; loadQuestion(); }

function endGame() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();

    gameElapsedSec = Math.round((Date.now() - gameStartTime) / 1000);
    const mins = Math.floor(gameElapsedSec / 60);
    const secs = gameElapsedSec % 60;
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

    questionTextElement.textContent = `Game Over! Final Score: ${roundedScore} / ${total}`;
    progressArea.style.display = 'none';
    hintBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    restartBtn.textContent = 'Restart';

    optionsArea.innerHTML = `
      <div class="col-span-4 space-y-4">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p class="text-xs text-indigo-400 font-semibold mb-1">Score</p>
            <p class="text-2xl font-extrabold text-indigo-600">${roundedScore}<span class="text-sm font-normal text-indigo-400">/${total}</span></p>
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
        <div class="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-3 border border-purple-100">
          <span class="text-sm font-bold text-purple-700">🏆 Best Score</span>
          <span class="text-sm font-bold text-purple-600">
            ${bestData ? `${bestData.score}pts · ${bestData.date}` : '-'}
            ${isNewBest ? '<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>' : ''}
          </span>
        </div>
        <div>
          <p class="text-sm font-bold text-gray-600 mb-2">📊 This Game Results</p>
          <div class="space-y-1 max-h-48 overflow-y-auto pr-1">
            ${answerLog.map(l => `
              <div class="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg ${l.correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}">
                <span class="${l.correct ? 'text-green-700' : 'text-red-700'} font-semibold">${l.correct ? '✅' : '❌'} ${l.name}</span>
                <span class="text-gray-400">${l.timeTaken}s</span>
              </div>`).join('')}
          </div>
        </div>
        ${renderWeakStats()}
        <button id="share-result-btn" class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          Share Results
        </button>
      </div>
    `;

    document.getElementById('share-result-btn').onclick = () => {
        const text = `📍 Korea City Quiz\nScore: ${roundedScore}/${total} · Accuracy ${accuracy}% · ${timeStr}\nChallenge now! 👇\n${window.location.href}`;
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
    const entries = Object.entries(stats).filter(([, v]) => v.wrong > 0)
        .sort((a, b) => b[1].wrong - a[1].wrong).slice(0, 5);
    if (entries.length === 0) return '';
    const bars = entries.map(([name, v]) => {
        const total = v.correct + v.wrong;
        const pct = Math.round((v.wrong / total) * 100);
        return `<div>
          <div class="flex justify-between text-xs text-gray-500 mb-0.5">
            <span class="font-semibold text-gray-700">${name}</span>
            <span>${v.wrong} wrong / ${total} shown</span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-red-400 h-2 rounded-full" style="width:${pct}%"></div>
          </div>
        </div>`;
    }).join('');
    return `<div><p class="text-sm font-bold text-gray-600 mb-2">📉 Most Missed Regions (All-time)</p><div class="space-y-2">${bars}</div></div>`;
}

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
    const distractors = shuffleArray(locations.map(l => l.name).filter(n => n !== correctAnswer));
    for (let i = 0; i < numOptions - 1 && i < distractors.length; i++) options.push(distractors[i]);
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
        detailedGuide.classList.toggle('hidden', !isHidden);
        toggleGuideBtn.textContent = isHidden ? 'Close Guide' : 'Open Detailed Game Guide';
    });
}

nextQuestionBtn.addEventListener('click', () => {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    if (currentQuestionIndex < shuffledGameLocations.length - 1) moveToNextQuestion();
    else endGame();
});