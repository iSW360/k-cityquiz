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
const QUESTION_TIME_LIMIT = 10;

// --- 최고 점수 / 통계 / 소요 시간 ---
let gameStartTime = null;      // 게임 시작 시각
let gameElapsedSec = 0;        // 게임 총 소요 시간(초)
let answerLog = [];            // 문제별 정오답 기록 [{name, correct, timeTaken}]
const LS_BEST = 'kcityquiz_best';      // localStorage 키 – 최고 점수
const LS_STATS = 'kcityquiz_stats';    // localStorage 키 – 지역별 통계

// --- 데이터 시작 (힌트 추가) ---
const locations = [
    { name: "서울", lat: 37.5665, lng: 126.9780, zoom: 9, geoName: "서울특별시", hint: "남산타워와 한강이 흐르는 대한민국의 수도" },
    { name: "부산", lat: 35.1796, lng: 129.0756, zoom: 9, geoName: "부산광역시", hint: "해운대 해수욕장과 자갈치 시장이 유명한 항구 도시" },
    { name: "인천", lat: 37.4563, lng: 126.7052, zoom: 9, geoName: "인천광역시", hint: "국제공항과 차이나타운이 있는 관문 도시" },
    { name: "대구", lat: 35.8714, lng: 128.6014, zoom: 9, geoName: "대구광역시", hint: "팔공산과 사과, 섬유 산업으로 유명한 분지 도시" },
    { name: "광주", lat: 35.1601, lng: 126.8515, zoom: 9, geoName: "광주광역시", hint: "무등산과 민주화 운동의 역사를 간직한 빛고을" },
    { name: "대전", lat: 36.3504, lng: 127.3845, zoom: 9, geoName: "대전광역시", hint: "성심당 빵집과 엑스포 과학공원이 있는 과학 도시" },
    { name: "울산", lat: 35.5384, lng: 129.3114, zoom: 9, geoName: "울산광역시", hint: "간절곶 해돋이와 자동차·조선 산업의 중심지" },
    { name: "세종", lat: 36.4801, lng: 127.2890, zoom: 10, geoName: "세종특별자치시", hint: "정부종합청사가 있는 행정중심복합도시" },
    { name: "수원시", lat: 37.2636, lng: 127.0286, zoom: 10, geoName: "수원시", hint: "유네스코 세계문화유산인 화성이 있는 곳" },
    { name: "성남시", lat: 37.4200, lng: 127.1269, zoom: 10, geoName: "성남시", hint: "판교 테크노밸리가 있는 IT 산업의 중심지" },
    { name: "고양시", lat: 37.6584, lng: 126.8320, zoom: 10, geoName: "고양시", hint: "일산 호수공원과 킨텍스(KINTEX) 전시장이 있는 곳" },
    { name: "용인시", lat: 37.2410, lng: 127.1779, zoom: 10, geoName: "용인시", hint: "에버랜드와 한국민속촌이 있는 관광 도시" },
    { name: "부천시", lat: 37.4986, lng: 126.7830, zoom: 11, geoName: "부천시", hint: "국제판타스틱영화제와 만화박물관으로 유명한 도시" },
    { name: "안산시", lat: 37.3219, lng: 126.8309, zoom: 10, geoName: "안산시", hint: "대부도와 다문화 거리가 유명한 서해안 도시" },
    { name: "안양시", lat: 37.3943, lng: 126.9568, zoom: 11, geoName: "안양시", hint: "예술공원과 평촌신도시가 있는 도시" },
    { name: "평택시", lat: 36.9923, lng: 127.1127, zoom: 10, geoName: "평택시", hint: "평택항과 세계 최대 규모의 반도체 공장이 있는 곳" },
    { name: "화성시", lat: 37.1995, lng: 126.8313, zoom: 10, geoName: "화성시", hint: "제부도 모세의 기적과 공룡알 화석지가 있는 곳" },
    { name: "남양주시", lat: 37.6360, lng: 127.2165, zoom: 10, geoName: "남양주시", hint: "다산 정약용 선생의 생가와 유적지가 있는 곳" },
    { name: "의정부시", lat: 37.7380, lng: 127.0336, zoom: 11, geoName: "의정부시", hint: "미군 부대의 영향으로 시작된 부대찌개가 유명한 곳" },
    { name: "시흥시", lat: 37.3800, lng: 126.8029, zoom: 10, geoName: "시흥시", hint: "오이도 빨간등대와 시흥 갯골생태공원이 유명함" },
    { name: "파주시", lat: 37.7600, lng: 126.7799, zoom: 10, geoName: "파주시", hint: "임진각 평화누리와 출판도시, 헤이리 마을이 있는 곳" },
    { name: "김포시", lat: 37.6153, lng: 126.7157, zoom: 10, geoName: "김포시", hint: "김포국제공항과 한강 신도시가 있는 도시" },
    { name: "광명시", lat: 37.4786, lng: 126.8650, zoom: 11, geoName: "광명시", hint: "버려진 폐광을 테마파크로 만든 동굴이 유명함" },
    { name: "군포시", lat: 37.3616, lng: 126.9350, zoom: 11, geoName: "군포시", hint: "수리산과 철쭉 축제가 아름다운 도시" },
    { name: "광주시", lat: 37.4292, lng: 127.2550, zoom: 10, geoName: "광주시", hint: "남한산성과 조선 백자 도요지가 있는 곳" },
    { name: "이천시", lat: 37.2799, lng: 127.4340, zoom: 10, geoName: "이천시", hint: "도자기 축제와 임금님표 쌀이 매우 유명함" },
    { name: "양주시", lat: 37.7853, lng: 127.0458, zoom: 10, geoName: "양주시", hint: "장욱진 미술관과 양주별산대놀이가 전승되는 곳" },
    { name: "오산시", lat: 37.1499, lng: 127.0776, zoom: 11, geoName: "오산시", hint: "물향기수목원과 독산성 세마대지가 있는 도시" },
    { name: "구리시", lat: 37.5939, lng: 127.1406, zoom: 11, geoName: "구리시", hint: "동구릉(조선 왕릉군)과 한강시민공원이 유명함" },
    { name: "안성시", lat: 37.0080, lng: 127.2797, zoom: 10, geoName: "안성시", hint: "안성마춤 놋그릇과 안성국밥, 남사당패가 유명함" },
    { name: "포천시", lat: 37.8949, lng: 127.2000, zoom: 10, geoName: "포천시", hint: "이동갈비와 막걸리, 산정호수가 유명한 관광지" },
    { name: "의왕시", lat: 37.3448, lng: 126.9688, zoom: 11, geoName: "의왕시", hint: "백운호수와 왕송호수 레일바이크가 유명한 도시" },
    { name: "하남시", lat: 37.5393, lng: 127.2147, zoom: 11, geoName: "하남시", hint: "스타필드 하남과 검단산 등산로가 유명함" },
    { name: "여주시", lat: 37.2983, lng: 127.6370, zoom: 10, geoName: "여주시", hint: "세종대왕의 영릉과 여주 프리미엄 아울렛이 있음" },
    { name: "동두천시", lat: 37.9036, lng: 127.0576, zoom: 11, geoName: "동두천시", hint: "소요산과 미군 문화가 어우러진 보산동 관광특구" },
    { name: "과천시", lat: 37.4292, lng: 126.9878, zoom: 11, geoName: "과천시", hint: "서울대공원, 국립현대미술관, 경마공원이 있는 곳" },
    { name: "춘천시", lat: 37.8813, lng: 127.7298, zoom: 10, geoName: "춘천시", hint: "닭갈비와 막국수, 남이섬으로 유명한 호반의 도시" },
    { name: "원주시", lat: 37.3425, lng: 127.9202, zoom: 10, geoName: "원주시", hint: "치악산과 한지(韓紙) 문화, 소금산 출렁다리가 유명함" },
    { name: "강릉시", lat: 37.7519, lng: 128.8761, zoom: 10, geoName: "강릉시", hint: "경포대 해수욕장과 커피 거리, 초당두부가 유명함" },
    { name: "동해시", lat: 37.5217, lng: 129.1139, zoom: 10, geoName: "동해시", hint: "무릉계곡과 추암 촛대바위 해돋이가 아름다운 곳" },
    { name: "속초시", lat: 38.2070, lng: 128.5918, zoom: 10, geoName: "속초시", hint: "설악산 대청봉과 아바이마을, 닭강정이 유명함" },
    { name: "삼척시", lat: 37.4498, lng: 129.1653, zoom: 10, geoName: "삼척시", hint: "환선굴과 대이리 동굴지대, 장호항 어촌마을이 있음" },
    { name: "태백시", lat: 37.1656, lng: 128.9856, zoom: 10, geoName: "태백시", hint: "눈축제와 과거 석탄 산업의 중심지" },
    { name: "청주시", lat: 36.6424, lng: 127.4891, zoom: 10, geoName: "청주시", hint: "세계 최고(最古) 금속활자인 직지심체요절의 고장" },
    { name: "충주시", lat: 36.9712, lng: 127.9299, zoom: 10, geoName: "충주시", hint: "충주호와 탄금대, 당도 높은 사과가 유명함" },
    { name: "제천시", lat: 37.1325, lng: 128.1922, zoom: 10, geoName: "제천시", hint: "의림지와 청풍명월, 약초(한방) 산업으로 유명함" },
    { name: "천안시", lat: 36.8151, lng: 127.1139, zoom: 10, geoName: "천안시", hint: "독립기념관과 유관순 열사 사적지, 호두과자가 유명함" },
    { name: "공주시", lat: 36.4525, lng: 127.1200, zoom: 10, geoName: "공주시", hint: "백제의 고도(古都)로 무령왕릉과 공산성이 유명함" },
    { name: "보령시", lat: 36.3334, lng: 126.6102, zoom: 10, geoName: "보령시", hint: "대천 해수욕장과 세계적인 머드(Mud) 축제가 열림" },
    { name: "아산시", lat: 36.7898, lng: 127.0020, zoom: 10, geoName: "아산시", hint: "현충사와 외암민속마을, 온양 온천이 유명함" },
    { name: "서산시", lat: 36.7800, lng: 126.4500, zoom: 10, geoName: "서산시", hint: "마애삼존불상과 간월도 어리굴젓이 유명함" },
    { name: "논산시", lat: 36.1868, lng: 127.0847, zoom: 10, geoName: "논산시", hint: "육군훈련소와 겨울철 달콤한 딸기가 매우 유명함" },
    { name: "계룡시", lat: 36.2741, lng: 127.2492, zoom: 11, geoName: "계룡시", hint: "육·해·공군 3군 본부인 계룡대가 위치한 국방 도시" },
    { name: "당진시", lat: 36.8933, lng: 126.6300, zoom: 10, geoName: "당진시", hint: "서해대교와 왜목마을 해돋이, 제철 산업의 중심지" },
    { name: "전주시", lat: 35.8242, lng: 127.1480, zoom: 10, geoName: "전주시", hint: "비빔밥과 한옥마을이 전 세계적으로 유명한 맛의 고장" },
    { name: "군산시", lat: 35.9700, lng: 126.7100, zoom: 10, geoName: "군산시", hint: "근대역사박물관과 선유도, 이성당 빵집이 유명함" },
    { name: "익산시", lat: 35.9461, lng: 126.9578, zoom: 10, geoName: "익산시", hint: "백제 무왕의 꿈이 담긴 미륵사지 석탑이 있는 곳" },
    { name: "정읍시", lat: 35.5700, lng: 126.8500, zoom: 10, geoName: "정읍시", hint: "가을 단풍이 절경인 내장산 국립공원이 있는 곳" },
    { name: "남원시", lat: 35.4000, lng: 127.3800, zoom: 10, geoName: "남원시", hint: "성춘향과 이도령의 사랑 이야기인 광한루원이 유명함" },
    { name: "김제시", lat: 35.8000, lng: 126.8800, zoom: 10, geoName: "김제시", hint: "우리나라 유일의 지평선을 볼 수 있는 벽골제가 있음" },
    { name: "목포시", lat: 34.8119, lng: 126.3917, zoom: 10, geoName: "목포시", hint: "유달산과 목포항, 세발낙지가 유명한 항구 도시" },
    { name: "여수시", lat: 34.7604, lng: 127.6622, zoom: 10, geoName: "여수시", hint: "여수 밤바다와 돌산 갓김치, 엑스포 해양공원이 유명함" },
    { name: "순천시", lat: 34.9500, lng: 127.4800, zoom: 10, geoName: "순천시", hint: "순천만 국가정원과 갈대밭이 아름다운 생태 도시" },
    { name: "나주시", lat: 35.0100, lng: 126.7100, zoom: 10, geoName: "나주시", hint: "달콤하고 시원한 나주 배와 나주 곰탕이 유명함" },
    { name: "광양시", lat: 34.9400, lng: 127.6900, zoom: 10, geoName: "광양시", hint: "광양제철소와 매화 축제, 광양 불고기가 유명함" },
    { name: "포항시", lat: 36.0190, lng: 129.3435, zoom: 10, geoName: "포항시", hint: "호미곶 상생의 손과 포스코 제철소, 과메기가 유명함" },
    { name: "구미시", lat: 36.1190, lng: 128.3445, zoom: 10, geoName: "구미시", hint: "금오산 국립공원과 전자 산업 단지가 밀집한 곳" },
    { name: "경주시", lat: 35.8562, lng: 129.2240, zoom: 10, geoName: "경주시", hint: "불국사와 석굴암, 첨성대 등 신라 천년의 고도" },
    { name: "안동시", lat: 36.5600, lng: 128.7200, zoom: 10, geoName: "안동시", hint: "하회마을과 안동찜닭, 간고등어, 안동소주가 유명함" },
    { name: "김천시", lat: 36.1300, lng: 128.1100, zoom: 10, geoName: "김천시", hint: "직지사와 혁신도시, 당도 높은 자두가 유명한 곳" },
    { name: "영주시", lat: 36.8000, lng: 128.6300, zoom: 10, geoName: "영주시", hint: "부석사 무량수전과 소수서원, 풍기 인삼이 유명함" },
    { name: "상주시", lat: 36.4100, lng: 128.1600, zoom: 10, geoName: "상주시", hint: "곶감이 전국적으로 유명하며 삼백(쌀, 명주, 곶감)의 고장" },
    { name: "영천시", lat: 35.9700, lng: 128.9300, zoom: 10, geoName: "영천시", hint: "보현산 천문대와 포도, 한약재 시장이 유명함" },
    { name: "문경시", lat: 36.5900, lng: 128.1900, zoom: 10, geoName: "문경시", hint: "문경새재 과거길과 오미자, 도자기가 유명한 곳" },
    { name: "경산시", lat: 35.8200, lng: 128.7300, zoom: 10, geoName: "경산시", hint: "많은 대학교가 밀집해 있으며 대추 생산량이 전국 1위임" },
    { name: "창원시", lat: 35.2280, lng: 128.6811, zoom: 10, geoName: "창원시", hint: "진해 군항제 벚꽃과 마창대교가 유명한 계획 도시" },
    { name: "김해시", lat: 35.2326, lng: 128.8800, zoom: 10, geoName: "김해시", hint: "가야 문화의 중심지로 수로왕릉과 봉하마을이 있음" },
    { name: "진주시", lat: 35.1800, lng: 128.0800, zoom: 10, geoName: "진주시", hint: "진주성 촉석루와 가을 유등 축제가 매우 아름다운 곳" },
    { name: "통영시", lat: 34.8400, lng: 128.4300, zoom: 10, geoName: "통영시", hint: "동피랑 벽화마을과 충무김밥, 꿀빵이 유명한 항구" },
    { name: "사천시", lat: 35.0800, lng: 128.0600, zoom: 10, geoName: "사천시", hint: "사천 바다 케이블카와 항공 우주 산업의 중심지" },
    { name: "밀양시", lat: 35.5000, lng: 128.7400, zoom: 10, geoName: "밀양시", hint: "영남루와 얼음골 결빙지, 밀양 아리랑의 고장" },
    { name: "거제시", lat: 34.8800, lng: 128.6200, zoom: 10, geoName: "거제시", hint: "바람의 언덕과 외도 보타니아, 조선 산업의 메카" },
    { name: "양산시", lat: 35.3300, lng: 129.0300, zoom: 10, geoName: "양산시", hint: "통도사와 내원사 계곡이 유명한 산악 관광 도시" },
    { name: "제주시", lat: 33.4996, lng: 126.5312, zoom: 9, geoName: "제주시", hint: "용두암과 제주국제공항, 한라산이 있는 세계적 관광지" },
    { name: "서귀포시", lat: 33.2543, lng: 126.5600, zoom: 9, geoName: "서귀포시", hint: "천지연 폭포와 성산 일출봉, 감귤이 유명한 남쪽 도시" },
    { name: "강화군", lat: 37.7479, lng: 126.4872, zoom: 10, geoName: "강화군", hint: "고인돌 유적지와 전등사, 강화 인삼이 유명한 역사 섬" },
    { name: "옹진군", lat: 37.4475, lng: 126.1408, zoom: 9, geoName: "옹진군", hint: "백령도, 연평도 등 서해 최북단의 섬들로 구성된 군" },
    { name: "가평군", lat: 37.8318, lng: 127.5096, zoom: 10, geoName: "가평군", hint: "잣 고장이며 아침고요수목원과 가평 펜션지가 유명함" },
    { name: "양평군", lat: 37.4916, lng: 127.4879, zoom: 10, geoName: "양평군", hint: "두물머리와 용문사 은행나무가 유명한 전원 도시" },
    { name: "연천군", lat: 38.0964, lng: 127.0744, zoom: 10, geoName: "연천군", hint: "구석기 유적지와 태풍전망대가 있는 최전방 접경지" },
    { name: "춘천시", lat: 37.8813, lng: 127.7298, zoom: 10, geoName: "춘천시", hint: "닭갈비와 막국수, 남이섬으로 유명한 호반의 도시" },
    { name: "고성군", lat: 38.3804, lng: 128.4678, zoom: 10, geoName: "고성군", hint: "금강산으로 향하는 통일전망대가 있는 동해안 군" },
    { name: "양구군", lat: 38.1093, lng: 127.9893, zoom: 10, geoName: "양구군", hint: "한반도의 정중앙 지점이 위치한 국토 정중앙의 고장" },
    { name: "양양군", lat: 38.0763, lng: 128.6219, zoom: 10, geoName: "양양군", hint: "송이버섯과 낙산사, 서핑 명소로 떠오른 해변 도시" },
    { name: "영월군", lat: 37.1866, lng: 128.4633, zoom: 10, geoName: "영월군", hint: "단종의 유배지인 청령포와 별마로 천문대가 유명함" },
    { name: "인제군", lat: 38.0691, lng: 128.1704, zoom: 10, geoName: "인제군", hint: "황태 덕장과 래프팅, 인제 스피디움이 있는 산악 지대" },
    { name: "정선군", lat: 37.3822, lng: 128.6607, zoom: 10, geoName: "정선군", hint: "정선 아리랑과 정선 5일장, 카지노(강원랜드)가 있는 곳" },
    { name: "철원군", lat: 38.1468, lng: 127.3134, zoom: 10, geoName: "철원군", hint: "고석정과 노동당사, 질 좋은 철원 오대쌀이 유명함" },
    { name: "평창군", lat: 37.3705, lng: 128.3916, zoom: 10, geoName: "평창군", hint: "2018 동계 올림픽 개최지이며 대관령 목장이 아름다움" },
    { name: "홍천군", lat: 37.6900, lng: 127.8853, zoom: 10, geoName: "홍천군", hint: "늘푸름 한우와 옥수수, 수타사가 유명한 넓은 땅의 군" },
    { name: "화천군", lat: 38.1065, lng: 127.7082, zoom: 10, geoName: "화천군", hint: "겨울철 산천어 축제가 전국적으로 유명한 접경 지역" },
    { name: "괴산군", lat: 36.8152, lng: 127.7863, zoom: 10, geoName: "괴산군", hint: "산막이옛길과 괴산 청결 고추가 유명한 산간 지방" },
    { name: "단양군", lat: 36.9840, lng: 128.3659, zoom: 10, geoName: "단양군", hint: "단양 8경과 만천하 스카이워크, 마늘이 유명함" },
    { name: "보은군", lat: 36.4883, lng: 127.7294, zoom: 10, geoName: "보은군", hint: "법주사와 정이품송, 품질 좋은 대추가 유명한 곳" },
    { name: "영동군", lat: 36.1746, lng: 127.7786, zoom: 10, geoName: "영동군", hint: "포도와 와인 산업, 난계 국악 축제가 열리는 고장" },
    { name: "옥천군", lat: 36.3057, lng: 127.5727, zoom: 10, geoName: "옥천군", hint: "정지용 시인의 고향이며 부소담악의 절경이 유명함" },
    { name: "음성군", lat: 36.9383, lng: 127.6896, zoom: 10, geoName: "음성군", hint: "음성 청결 고추와 반기문 전 UN사무총장의 생가가 있음" },
    { name: "증평군", lat: 36.7844, lng: 127.5824, zoom: 10, geoName: "증평군", hint: "좌구산 휴양림과 에듀팜 특구가 유명한 작지만 강한 군" },
    { name: "진천군", lat: 36.8562, lng: 127.4422, zoom: 10, geoName: "진천군", hint: "농다리와 생거진천 쌀로 유명하며 국가대표 선수촌이 있음" },
    { name: "금산군", lat: 36.1037, lng: 127.4891, zoom: 10, geoName: "금산군", hint: "우리나라 인삼 유통의 중심지로 인삼 축제가 열림" },
    { name: "부여군", lat: 36.2795, lng: 126.9122, zoom: 10, geoName: "부여군", hint: "백제의 옛 수도로 낙화암과 정림사지 오층석탑이 있음" },
    { name: "서천군", lat: 36.0792, lng: 126.6908, zoom: 10, geoName: "서천군", hint: "한산모시와 소곡주, 국립생태원이 있는 서해안 고장" },
    { name: "예산군", lat: 36.6801, lng: 126.8451, zoom: 10, geoName: "예산군", hint: "예당호 출렁다리와 덕산 온천, 예산 사과가 유명함" },
    { name: "청양군", lat: 36.4022, lng: 126.8013, zoom: 10, geoName: "청양군", hint: "칠갑산과 매운 청양 고추, 구기자가 유명한 곳" },
    { name: "태안군", lat: 36.7533, lng: 126.2995, zoom: 10, geoName: "태안군", hint: "안면도 해수욕장과 꽃 축제, 서해안 해안국립공원이 있음" },
    { name: "홍성군", lat: 36.5984, lng: 126.6631, zoom: 10, geoName: "홍성군", hint: "한우와 남당항 새조개 축제가 유명하며 충남 도청 소재지" },
    { name: "고창군", lat: 35.4357, lng: 126.7027, zoom: 10, geoName: "고창군", hint: "고창읍성과 고인돌 유적, 복분자와 풍천장어가 유명함" },
    { name: "무주군", lat: 36.0076, lng: 127.6601, zoom: 10, geoName: "무주군", hint: "덕유산 리조트 스키장과 반딧불 축제가 열리는 청정 지역" },
    { name: "부안군", lat: 35.7323, lng: 126.7320, zoom: 10, geoName: "부안군", hint: "채석강과 변산반도 국립공원, 내소사가 유명함" },
    { name: "순창군", lat: 35.3748, lng: 127.1408, zoom: 10, geoName: "순창군", hint: "강천산과 고추장 민속마을의 고추장이 매우 유명함" },
    { name: "완주군", lat: 35.9149, lng: 127.2456, zoom: 10, geoName: "완주군", hint: "대둔산과 삼례문화예술촌이 있으며 전주를 둘러싼 군" },
    { name: "임실군", lat: 35.6190, lng: 127.2842, zoom: 10, geoName: "임실군", hint: "우리나라 치즈 산업의 발상지인 임실치즈마을이 유명함" },
    { name: "장수군", lat: 35.6476, lng: 127.5215, zoom: 10, geoName: "장수군", hint: "논개의 생가와 사과, 한우가 유명한 고원 지대" },
    { name: "진안군", lat: 35.7925, lng: 127.4288, zoom: 10, geoName: "진안군", hint: "말의 귀를 닮은 마이산과 홍삼이 매우 유명함" },
    { name: "강진군", lat: 34.6401, lng: 126.7695, zoom: 10, geoName: "강진군", hint: "다산 초당과 고려 청자 박물관이 유명한 역사 고장" },
    { name: "고흥군", lat: 34.6069, lng: 127.2757, zoom: 10, geoName: "고흥군", hint: "나로우주센터와 유자, 팔영산 국립공원이 유명함" },
    { name: "곡성군", lat: 35.2825, lng: 127.2917, zoom: 10, geoName: "곡성군", hint: "섬진강 기차마을과 장미 축제, 멜론이 유명함" },
    { name: "구례군", lat: 35.2057, lng: 127.4628, zoom: 10, geoName: "구례군", hint: "지리산 노고단과 산수유 축제, 화엄사가 있는 곳" },
    { name: "담양군", lat: 35.3217, lng: 126.9850, zoom: 10, geoName: "담양군", hint: "메타세쿼이아 길과 죽녹원의 대나무 숲이 유명함" },
    { name: "보성군", lat: 34.7712, lng: 127.0811, zoom: 10, geoName: "보성군", hint: "끝없이 펼쳐진 녹차 밭과 벌교 꼬막으로 유명한 고장" },
    { name: "신안군", lat: 34.8322, lng: 126.1193, zoom: 9, geoName: "신안군", hint: "1004개의 섬으로 이루어져 있으며 천일염이 매우 유명함" },
    { name: "영광군", lat: 35.2778, lng: 126.5132, zoom: 10, geoName: "영광군", hint: "백수해안도로와 밥도둑인 영광 법성포 굴비가 유명함" },
    { name: "완도군", lat: 34.3100, lng: 126.7578, zoom: 10, geoName: "완도군", hint: "청해진 장보고 유적지와 전복 생산지로 가장 유명함" },
    { name: "해남군", lat: 34.5739, lng: 126.5986, zoom: 10, geoName: "해남군", hint: "한반도 육지 끝인 땅끝마을과 대흥사가 있는 곳" },
    { name: "고령군", lat: 35.7289, lng: 128.2619, zoom: 10, geoName: "고령군", hint: "대가야의 도읍지였으며 대가야 박물관과 고분군이 유명함" },
    { name: "봉화군", lat: 36.8929, lng: 128.7360, zoom: 10, geoName: "봉화군", hint: "청량산과 산송이, 분천역 산타마을이 유명한 오지 마을" },
    { name: "성주군", lat: 35.9198, lng: 128.2839, zoom: 10, geoName: "성주군", hint: "당도 높고 아삭한 참외가 전국적으로 가장 유명함" },
    { name: "영덕군", lat: 36.4136, lng: 129.3653, zoom: 10, geoName: "영덕군", hint: "강구항의 영덕 대게가 전국적으로 최고의 명성을 가짐" },
    { name: "울릉군", lat: 37.4851, lng: 130.9056, zoom: 10, geoName: "울릉군", hint: "동해의 보석 같은 섬으로 호박엿과 오징어가 유명함" },
    { name: "울진군", lat: 36.9946, lng: 129.4022, zoom: 10, geoName: "울진군", hint: "불영계곡과 백암온천, 대게와 송이버섯이 유명함" },
    { name: "의성군", lat: 36.3533, lng: 128.6983, zoom: 10, geoName: "의성군", hint: "마늘 하면 가장 먼저 떠오르는 곳으로 마늘이 매우 유명함" },
    { name: "청도군", lat: 35.6473, lng: 128.7344, zoom: 10, geoName: "청도군", hint: "청도 소싸움 축제와 씨 없는 감인 반시가 유명함" },
    { name: "청송군", lat: 36.4353, lng: 129.0583, zoom: 10, geoName: "청송군", hint: "주왕산 국립공원과 주산지, 꿀맛 같은 사과가 유명함" },
    { name: "거창군", lat: 35.6874, lng: 127.9096, zoom: 10, geoName: "거창군", hint: "수승대 계곡과 거창 사과가 유명한 서부 경남의 군" },
    { name: "남해군", lat: 34.8361, lng: 127.8922, zoom: 10, geoName: "남해군", hint: "독일마을과 다랭이논, 상주은모래비치가 아름다움" },
    { name: "창녕군", lat: 35.5458, lng: 128.4913, zoom: 10, geoName: "창녕군", hint: "우포늪과 부곡 온천이 전국적으로 매우 유명한 곳" },
    { name: "하동군", lat: 35.0673, lng: 127.7516, zoom: 10, geoName: "하동군", hint: "화개장터와 최참판댁, 야생 녹차가 유명한 고장" },
    { name: "합천군", lat: 35.5667, lng: 128.1658, zoom: 10, geoName: "합천군", hint: "해인사 팔만대장경과 황매산 철쭉, 합천 영상테마파크" }
];
// --- 데이터 끝 ---


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
    '전북': 60, '전남': 90, '경북': 0, '경남': 50,
    '제주': 240
};

function getProvinceFromCode(code) {
    const prefix = code.substring(0, 2);
    const provinceCodeMap = {
        '11': '서울', '21': '부산', '22': '대구', '23': '인천',
        '24': '광주', '25': '대전', '26': '울산', '29': '세종',
        '31': '경기', '32': '강원특별자치도', '33': '충북', '34': '충남',
        '35': '전북특별자치도', '36': '전남', '37': '경북', '38': '경남',
        '39': '제주'
    };
    return provinceCodeMap[prefix] || '기타';
}

function getColorForRegion(name, code) {
    const province = getProvinceFromCode(code);
    const provinceKey = province.substring(0, 2);
    const hue = provinceHueMap[provinceKey] || provinceHueMap[province] || 0;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash += name.charCodeAt(i);
    }
    const lightness = 40 + (hash % 30);
    return `hsl(${hue}, 60%, ${lightness}%)`;
}

// =============================================
// 타이머 UI 생성 함수
// =============================================
function createTimerUI() {
    // 기존 타이머가 있으면 제거
    const existing = document.getElementById('question-timer');
    if (existing) existing.remove();

    const timerEl = document.createElement('div');
    timerEl.id = 'question-timer';
    timerEl.className = 'flex items-center justify-center gap-2 mb-3';
    timerEl.innerHTML = `
        <div class="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div id="timer-bar" class="h-3 rounded-full transition-all duration-1000 ease-linear bg-indigo-500" style="width:100%"></div>
        </div>
        <span id="timer-text" class="text-sm font-bold text-indigo-600 min-w-[2.5rem] text-right">${QUESTION_TIME_LIMIT}초</span>
    `;

    // question-area 위에 삽입
    const questionArea = document.getElementById('question-area');
    questionArea.parentNode.insertBefore(timerEl, questionArea);
}

function startQuestionTimer() {
    // 기존 타이머 정리
    if (questionTimer) clearInterval(questionTimer);

    questionTimeLeft = QUESTION_TIME_LIMIT;
    createTimerUI();

    const timerBar = document.getElementById('timer-bar');
    const timerText = document.getElementById('timer-text');

    questionTimer = setInterval(() => {
        questionTimeLeft--;

        // 바 너비 업데이트
        const pct = (questionTimeLeft / QUESTION_TIME_LIMIT) * 100;
        if (timerBar) timerBar.style.width = pct + '%';
        if (timerText) timerText.textContent = questionTimeLeft + '초';

        // 색상 변화: 남은 시간에 따라
        if (timerBar) {
            if (questionTimeLeft <= 5) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-red-500';
                if (timerText) timerText.className = 'text-sm font-bold text-red-600 min-w-[2.5rem] text-right';
            } else if (questionTimeLeft <= 10) {
                timerBar.className = 'h-3 rounded-full transition-all duration-1000 ease-linear bg-amber-500';
                if (timerText) timerText.className = 'text-sm font-bold text-amber-600 min-w-[2.5rem] text-right';
            }
        }

        // 시간 초과
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

    // 시간 초과도 오답으로 기록
    answerLog.push({ name: correctAnswerName, correct: false, timeTaken: QUESTION_TIME_LIMIT });
    saveLocationStats(correctAnswerName, false);

    // 모든 버튼 비활성화
    Array.from(optionsArea.children).forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-70', 'cursor-not-allowed');
        // 정답 버튼 표시
        if (btn.textContent === correctAnswerName) {
            btn.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300', 'opacity-70');
            btn.classList.add('bg-green-500', 'text-white', 'border-green-700');
        }
    });

    feedbackTextElement.innerHTML = `<span class="text-orange-600 font-bold">⏰ 시간 초과! 정답은 <strong>${correctAnswerName}</strong> 입니다.</span>`;
    feedbackTextElement.className = 'text-md font-medium';

    const btnLabel = (currentQuestionIndex < shuffledGameLocations.length - 1) ? '다음 문제' : '결과 보기';
    nextQuestionBtn.textContent = `${btnLabel} (3초)`;
    nextQuestionBtn.style.display = 'inline-block';
    hintBtn.style.display = 'none';

    let countdown = 3;
    countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            nextQuestionBtn.textContent = `${btnLabel} (${countdown}초)`;
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);

    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) {
            moveToNextQuestion();
        } else {
            endGame();
        }
    }, 3000);
}

// =============================================

async function initMap() {
    mapErrorInfo.textContent = '지도 및 행정구역 데이터 로딩 중...';
    if (map) map.remove();
    map = L.map('map').setView([36.5, 127.5], 7);

    const cartoTileUrl = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
    const cartoAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>';

    L.tileLayer(cartoTileUrl, {
        attribution: cartoAttribution,
        subdomains: 'abcd', maxZoom: 19,
        errorTileUrl: 'https://placehold.co/256x256/f0f0f0/cc0000?text=Map+Tile+Error'
    }).on('tileerror', function (event) {
        mapErrorInfo.textContent = '지도 타일 로딩에 실패했습니다.';
    }).addTo(map);

    const geoJsonUrl = 'https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json';

    try {
        const response = await fetch(geoJsonUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (geoJsonLayer && map.hasLayer(geoJsonLayer)) geoJsonLayer.remove();
        geoJsonLayer = L.geoJSON(data, {
            style: function (feature) {
                const name = feature.properties.name || '';
                const code = feature.properties.code || '';
                const color = getColorForRegion(name, code);
                return { color, weight: 1.2, opacity: 0.7, fillOpacity: 0.3, fillColor: color };
            },
            onEachFeature: function (feature, layer) {
                layer.on({
                    mouseover: function (e) {
                        const l = e.target;
                        l.setStyle({ weight: 3, fillOpacity: 0.4 });
                        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) l.bringToFront();
                    },
                    mouseout: function (e) {
                        if (geoJsonLayer) geoJsonLayer.resetStyle(e.target);
                    }
                });
            }
        }).addTo(map);
        mapErrorInfo.textContent = '';
    } catch (error) {
        mapErrorInfo.textContent = '행정구역 외곽선 데이터 로딩에 실패했습니다.';
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
        geoJsonLayer.eachLayer(function (layer) {
            const featureName = layer.feature.properties.name || '';
            if (featureName.startsWith(questionGeoName)) {
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

    // 타이머 UI 제거
    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();

    quizContainer.style.display = 'none';
    difficultySelector.style.display = 'block';
    questionTextElement.textContent = '게임 시작 버튼을 눌러주세요!';
    progressArea.style.display = 'none';
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

    const allShuffledLocations = shuffleArray([...locations]);
    shuffledGameLocations = allShuffledLocations.slice(0, MAX_QUESTIONS_PER_GAME);

    totalQuestionsElement.textContent = shuffledGameLocations.length;
    progressArea.style.display = 'block';

    questionTextElement.textContent = "지도 로딩 중... 잠시만 기다려주세요.";
    restartBtn.disabled = true;

    if (!map) {
        try {
            await initMap();
        } catch (e) {
            mapErrorInfo.textContent = "지도 초기화에 실패했습니다.";
            questionTextElement.textContent = "지도 로딩 실패! 새로고침하거나 나중에 다시 시도해주세요.";
            restartBtn.disabled = false;
            return;
        }
    } else {
        if (marker && map.hasLayer(marker)) marker.remove();
        if (geoJsonLayer) {
            geoJsonLayer.eachLayer(function (layer) { geoJsonLayer.resetStyle(layer); });
        }
    }

    restartBtn.disabled = false;
    restartBtn.textContent = '처음으로';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'inline-flex';
    hintBtn.disabled = false;
    hintBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    if (map) {
        loadQuestion();
    } else {
        questionTextElement.textContent = "지도 로딩 실패! 게임을 진행할 수 없습니다.";
    }
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
    questionTimeLeft = QUESTION_TIME_LIMIT; // 문제 시작 시각 초기화

    questionTextElement.textContent = "이 표시는 어느 지역을 나타낼까요?";
    currentQuestionElement.textContent = currentQuestionIndex + 1;

    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(function (layer) { geoJsonLayer.resetStyle(layer); });
    }
    if (currentLocation.geoName) {
        highlightCurrentQuestionRegion(currentLocation.geoName);
    }

    const latLng = [currentLocation.lat, currentLocation.lng];
    if (marker) marker.setLatLng(latLng).addTo(map);
    else marker = L.marker(latLng).addTo(map);

    map.setView(latLng, PROVINCE_VIEW_ZOOM);

    setTimeout(() => {
        if (map) {
            const adjustedZoom = (currentLocation.zoom || 10) - 3;
            const finalZoom = Math.max(adjustedZoom, PROVINCE_VIEW_ZOOM - 1);
            map.flyTo(latLng, finalZoom, { duration: 1 });
        }
    }, CITY_VIEW_DELAY);

    optionsArea.innerHTML = '';
    const options = generateOptions(correctAnswerName);

    options.forEach(optionName => {
        const button = document.createElement('button');
        button.textContent = optionName;
        button.className = "option-button w-full bg-white hover:bg-indigo-100 text-indigo-700 font-semibold py-2 px-3 border border-indigo-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400";
        button.onclick = () => handleAnswer(optionName, button);
        optionsArea.appendChild(button);
    });

    feedbackTextElement.textContent = '';
    feedbackTextElement.className = 'text-md sm:text-lg font-medium';
    nextQuestionBtn.style.display = 'none';
    hintBtn.style.display = 'inline-flex';

    // 타이머 시작 (지도 이동 후 시작)
    setTimeout(() => {
        startQuestionTimer();
    }, CITY_VIEW_DELAY + 1000);
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

    const currentLocation = shuffledGameLocations[currentQuestionIndex];
    const isCorrect = selectedName === correctAnswerName;

    // 소요 시간 및 정오답 기록
    const timeTaken = QUESTION_TIME_LIMIT - questionTimeLeft;
    answerLog.push({ name: correctAnswerName, correct: isCorrect, timeTaken });
    saveLocationStats(correctAnswerName, isCorrect);

    // 남은 시간 보너스 점수 계산
    const timeBonus = questionTimeLeft > 0 ? (questionTimeLeft / QUESTION_TIME_LIMIT) : 0;

    if (isCorrect) {
        let gainedScore;
        if (currentQuestionHintUsed) {
            gainedScore = 0.5;
        } else {
            // 빠를수록 최대 1점 (기본 0.5 + 시간 보너스 최대 0.5)
            gainedScore = Math.round((0.5 + timeBonus * 0.5) * 10) / 10;
        }
        score += gainedScore;
        const timeMsg = currentQuestionHintUsed ? '' : ` ⚡ 빠른 정답 보너스!`;
        feedbackTextElement.innerHTML = `<span class="text-green-600 font-bold">정답입니다! 🎉 (+${gainedScore}점)${timeMsg}</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(currentLocation.hint, correctAnswerName)}</span>`;
        buttonElement.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300');
        buttonElement.classList.add('bg-green-500', 'text-white', 'border-green-700');
    } else {
        feedbackTextElement.innerHTML = `<span class="text-red-600 font-bold">오답입니다. 정답은 ${correctAnswerName} 입니다. 😥</span><br><span class="text-gray-600 text-xs sm:text-sm mt-1">📍 ${maskHint(currentLocation.hint, correctAnswerName)}</span>`;
        buttonElement.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300');
        buttonElement.classList.add('bg-red-500', 'text-white', 'border-red-700');

        Array.from(optionsArea.children).forEach(btn => {
            if (btn.textContent === correctAnswerName) {
                btn.classList.remove('bg-white', 'text-indigo-700', 'border-indigo-300', 'opacity-70');
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
        if (countdown > 0) {
            nextQuestionBtn.textContent = `${btnLabel} (${countdown}초)`;
        } else {
            clearInterval(countdownInterval);
        }
    }, 1000);

    autoNextTimer = setTimeout(() => {
        if (currentQuestionIndex < shuffledGameLocations.length - 1) {
            moveToNextQuestion();
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

function moveToNextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function endGame() {
    stopQuestionTimer();
    if (autoNextTimer) clearTimeout(autoNextTimer);
    if (countdownInterval) clearInterval(countdownInterval);

    const timerEl = document.getElementById('question-timer');
    if (timerEl) timerEl.remove();

    // 게임 소요 시간 계산
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
        localStorage.setItem(LS_BEST, JSON.stringify({ score: roundedScore, elapsed: gameElapsedSec, date: new Date().toLocaleDateString('ko-KR') }));
    }
    const bestData = JSON.parse(localStorage.getItem(LS_BEST));

    questionTextElement.textContent = `게임 종료! 최종 점수: ${roundedScore} / ${total}`;
    progressArea.style.display = 'none';
    hintBtn.style.display = 'none';
    nextQuestionBtn.style.display = 'none';
    restartBtn.textContent = '처음으로';

    // 결과 패널 렌더링
    optionsArea.innerHTML = `
      <div class="col-span-4 space-y-4">

        <!-- 요약 카드 -->
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <p class="text-xs text-indigo-400 font-semibold mb-1">최종 점수</p>
            <p class="text-2xl font-extrabold text-indigo-600">${roundedScore}<span class="text-sm font-normal text-indigo-400">/${total}</span></p>
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
        <div class="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-3 border border-purple-100">
          <span class="text-sm font-bold text-purple-700">🏆 역대 최고 점수</span>
          <span class="text-sm font-bold text-purple-600">
            ${bestData ? `${bestData.score}점 · ${bestData.date}` : '-'}
            ${isNewBest ? '<span class="ml-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded-full">NEW!</span>' : ''}
          </span>
        </div>

        <!-- 정답률 통계 -->
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

        <!-- 자주 틀리는 지역 통계 -->
        ${renderWeakStats()}

        <!-- 공유 버튼 -->
        <button id="share-result-btn"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
          결과 공유하기
        </button>
      </div>
    `;

    document.getElementById('share-result-btn').onclick = () => {
        const text = `📍 대한민국 도시 퀴즈\n점수: ${roundedScore}/${total} · 정답률 ${accuracy}% · ${timeStr}\n지금 도전! 👇\n${window.location.href}`;
        navigator.clipboard.writeText(text).then(() => alert('결과가 클립보드에 복사되었습니다!'));
    };

    if (marker && map && map.hasLayer(marker)) marker.remove();
    if (geoJsonLayer) {
        geoJsonLayer.eachLayer(function (layer) { geoJsonLayer.resetStyle(layer); });
    }
}

// =============================================
// localStorage 지역 통계 저장/조회
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
        <p class="text-sm font-bold text-gray-600 mb-2">📉 자주 틀리는 지역 (누적)</p>
        <div class="space-y-2">${bars}</div>
      </div>
    `;
}

// =============================================
// 힌트에서 정답 지역명 자동 마스킹
// 예) "평택항" → "〇〇항", "영덕 대게" → "〇〇 대게"
// =============================================
function maskHint(hint, locationName) {
    // 지역 유형 접미사 제거: 시·군·구·동·읍 등
    const baseName = locationName.replace(/(특별시|광역시|특별자치시|특별자치도|시|군|구|동|읍|면)$/, '');

    // 마스킹 문자: 글자 수만큼 〇 반복
    const mask = '〇'.repeat(baseName.length);

    // 정규식: 지역명 전체(시/군/구 포함) + 기본명 모두 치환
    // 예) "평택시" → "〇〇〇", "평택" → "〇〇"
    const escaped = locationName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const baseEscaped = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let masked = hint
        .replace(new RegExp(escaped, 'g'), mask + locationName.slice(baseName.length)) // 시/군/구는 남김
        .replace(new RegExp(baseEscaped, 'g'), mask); // 기본명만 있는 경우도 처리

    return masked;
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
    const distractors = locations
        .map(loc => loc.name)
        .filter(name => name !== correctAnswer);

    shuffleArray(distractors);

    for (let i = 0; i < numOptions - 1 && i < distractors.length; i++) {
        options.push(distractors[i]);
    }

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
        moveToNextQuestion();
    } else {
        endGame();
    }
});