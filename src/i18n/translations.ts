export type LanguageCode =
  | 'en'
  | 'hi'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'kn'
  | 'es'
  | 'fr'
  | 'de'
  | 'ar'
  | 'zh'
  | 'ja';

export interface LanguageOption {
  code: LanguageCode;
  nativeName: string;
  englishName: string;
  dir?: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', dir: 'ltr' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', dir: 'ltr' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', dir: 'ltr' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', dir: 'ltr' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', dir: 'ltr' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese', dir: 'ltr' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', dir: 'ltr' },
];

export interface TranslationStrings {
  brand: string;
  navOverview: string;
  navLab: string;
  navRover: string;
  navCoding: string;
  navComponents: string;
  navPublish: string;
  installApp: string;
  installIOS: string;
  installedBadge: string;
  languageLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  startRoboticsBtn: string;
  startCodingBtn: string;
  freeForeverLine: string;
  trackRoboticsTitle: string;
  trackRoboticsDesc: string;
  trackRoverTitle: string;
  trackRoverDesc: string;
  trackCodingTitle: string;
  trackCodingDesc: string;
  runPractical: string;
  pausePractical: string;
  resetPractical: string;
  clearWires: string;
  addComponent: string;
  selectPractical: string;
  pinMonitor: string;
  serialOutput: string;
  envControls: string;
  stepsTitle: string;
  wiringHint: string;
  roverRunBlocks: string;
  roverReset: string;
  roverObstacleMode: string;
  roverManualControl: string;
  roverMapSelect: string;
  codingBlocksTab: string;
  codingPythonTab: string;
  codingWebTab: string;
  codingJsTab: string;
  codingCppTab: string;
  runCode: string;
  clearOutput: string;
  lessonsTitle: string;
  certificateBtn: string;
  generatedCodeTitle: string;
  addBlockTitle: string;
  searchComponents: string;
  allCategories: string;
  tryInLab: string;
  publishTitle: string;
  publishSubtitle: string;
  offlineBanner: string;
  saveProgress: string;
  savedToast: string;
  xpLabel: string;
  practicalsDoneLabel: string;
  profileLabel: string;
  footerCopyright: string;
}

const en: TranslationStrings = {
  brand: 'HARRBOTIX',
  navOverview: 'Overview',
  navLab: 'Robotics Lab',
  navRover: 'Rover Arena',
  navCoding: 'Coding Studio',
  navComponents: 'Components',
  navPublish: 'App & Legal',
  installApp: 'Install App',
  installIOS: 'Install iOS',
  installedBadge: 'Installed',
  languageLabel: 'Language',
  heroTitle: 'Build real robots and learn computer coding free of cost',
  heroSubtitle:
    'An interactive STEM workbench for kids across Android, iPhone, and Windows. Wire sensors and motors, drive virtual rovers, snap visual coding blocks, and write Python, JavaScript, HTML, and Arduino C++ offline.',
  startRoboticsBtn: 'Open Robotics Lab',
  startCodingBtn: 'Open Coding Studio',
  freeForeverLine: '100% Free Forever · Zero Ads · Works Offline · 14 Languages',
  trackRoboticsTitle: '01. Interactive Circuit Workbench',
  trackRoboticsDesc:
    'Wire Arduino, ESP32, ultrasonic sensors, servos, motors, LCDs, and LEDs with live electrical flow simulation.',
  trackRoverTitle: '02. Autonomous Rover Arena',
  trackRoverDesc:
    'Test obstacle avoidance and line-following algorithms on a 2D physics grid with ultrasonic raycasting.',
  trackCodingTitle: '03. Visual Blocks to Real Code',
  trackCodingDesc:
    'Snap no-code logic blocks and watch them convert into Python, JavaScript, HTML/CSS, and Arduino C++.',
  runPractical: 'Run Practical',
  pausePractical: 'Pause',
  resetPractical: 'Reset',
  clearWires: 'Clear Wires',
  addComponent: 'Add Component',
  selectPractical: 'Guided Practicals',
  pinMonitor: 'Live Pin & Voltage Monitor',
  serialOutput: 'Serial Monitor',
  envControls: 'Sensor Environment Controls',
  stepsTitle: 'Practical Steps',
  wiringHint: 'Click a component pin then another pin to wire. Drag parts to arrange.',
  roverRunBlocks: 'Run Block Program',
  roverReset: 'Reset Rover',
  roverObstacleMode: 'Click grid cells to toggle obstacle walls',
  roverManualControl: 'Manual Drive Pad',
  roverMapSelect: 'Arena Track',
  codingBlocksTab: 'Visual Blocks',
  codingPythonTab: 'Python',
  codingWebTab: 'HTML & CSS',
  codingJsTab: 'JavaScript',
  codingCppTab: 'Arduino C++',
  runCode: 'Run Code',
  clearOutput: 'Clear',
  lessonsTitle: 'Free Interactive Lessons',
  certificateBtn: 'Get Certificate',
  generatedCodeTitle: 'Live Generated Code',
  addBlockTitle: 'Add Coding Block',
  searchComponents: 'Search sensors, motors, boards...',
  allCategories: 'All',
  tryInLab: 'Try in Lab',
  publishTitle: 'Play Store, App Store, Windows & Legal Guide',
  publishSubtitle:
    'Everything required to install HARRBOTIX on any device and publish it legally to app stores with zero coding required.',
  offlineBanner: 'Offline Mode — All robotics labs and coding tools remain active.',
  saveProgress: 'Export Project',
  savedToast: 'Project exported',
  xpLabel: 'Learning XP',
  practicalsDoneLabel: 'Practicals Completed',
  profileLabel: 'Profile',
  footerCopyright: 'HARRBOTIX · Free Open STEM Education for Children Everywhere',
};

const hi: TranslationStrings = {
  brand: 'HARRBOTIX',
  navOverview: 'मुख्य पृष्ठ',
  navLab: 'रोबोटिक्स लैब',
  navRover: 'रोवर अरीना',
  navCoding: 'कोडिंग स्टूडियो',
  navComponents: 'कंपोनेंट्स',
  navPublish: 'ऐप और नियम',
  installApp: 'ऐप इंस्टॉल करें',
  installIOS: 'iPhone इंस्टॉल',
  installedBadge: 'इंस्टॉल्ड',
  languageLabel: 'भाषा',
  heroTitle: 'बच्चों के लिए मुफ़्त रोबोटिक्स लैब और कंप्यूटर कोडिंग सीखने का मंच',
  heroSubtitle:
    'Android, iPhone और Windows के लिए संपूर्ण STEM कार्यशाला। सेंसर और मोटर जोड़ें, वर्चुअल रोवर चलाएँ, बिना टाइप किए ब्लॉक कोडिंग करें, और Python, JavaScript, HTML व Arduino C++ सीखें।',
  startRoboticsBtn: 'रोबोटिक्स लैब खोलें',
  startCodingBtn: 'कोडिंग स्टूडियो खोलें',
  freeForeverLine: '100% हमेशा मुफ़्त · बिना विज्ञापन · ऑफलाइन चलता है · 14 भाषाएँ',
  trackRoboticsTitle: '01. इंटरैक्टिव सर्किट वर्कबेंच',
  trackRoboticsDesc:
    'Arduino, ESP32, अल्ट्रासोनिक सेंसर, सर्वो मोटर, DC मोटर, LCD और LED को वायर से जोड़कर लाइव प्रैक्टिकल करें।',
  trackRoverTitle: '02. ऑटोनॉमस रोवर अरीना',
  trackRoverDesc:
    '2D ग्रिड ट्रैक पर सेंसर की मदद से बाधाओं से बचने और लाइन फॉलो करने वाला रोबोट चलाएँ।',
  trackCodingTitle: '03. ब्लॉक से असली कोडिंग तक',
  trackCodingDesc:
    'बिना टाइप किए विज़ुअल ब्लॉक जोड़ें और उन्हें तुरंत Python, JavaScript, HTML/CSS और Arduino C++ में बदलते देखें।',
  runPractical: 'प्रैक्टिकल चलाएँ',
  pausePractical: 'रोकें',
  resetPractical: 'रीसेट करें',
  clearWires: 'तार हटाएँ',
  addComponent: 'कंपोनेंट जोड़ें',
  selectPractical: 'प्रैक्टिकल चुनें',
  pinMonitor: 'लाइव पिन और वोल्टेज मॉनिटर',
  serialOutput: 'सीरियल मॉनिटर',
  envControls: 'सेंसर वातावरण नियंत्रण',
  stepsTitle: 'प्रैक्टिकल के चरण',
  wiringHint: 'तार जोड़ने के लिए एक पिन पर क्लिक करें फिर दूसरी पिन पर। पुर्ज़े खींचकर रखें।',
  roverRunBlocks: 'ब्लॉक प्रोग्राम चलाएँ',
  roverReset: 'रोवर रीसेट करें',
  roverObstacleMode: 'दीवार बनाने या हटाने के लिए ग्रिड पर क्लिक करें',
  roverManualControl: 'मैनुअल कंट्रोल पैड',
  roverMapSelect: 'अरीना ट्रैक',
  codingBlocksTab: 'विज़ुअल ब्लॉक',
  codingPythonTab: 'Python',
  codingWebTab: 'HTML और CSS',
  codingJsTab: 'JavaScript',
  codingCppTab: 'Arduino C++',
  runCode: 'कोड चलाएँ',
  clearOutput: 'साफ़ करें',
  lessonsTitle: 'मुफ़्त कोडिंग पाठ',
  certificateBtn: 'सर्टिफिकेट प्राप्त करें',
  generatedCodeTitle: 'लाइव बना हुआ कोड',
  addBlockTitle: 'कोडिंग ब्लॉक जोड़ें',
  searchComponents: 'सेंसर, मोटर, बोर्ड खोजें...',
  allCategories: 'सभी',
  tryInLab: 'लैब में चलाएँ',
  publishTitle: 'Play Store, App Store, Windows और कानूनी गाइड',
  publishSubtitle:
    'बिना कोडिंग जाने इस ऐप को अपने फ़ोन/कंप्यूटर पर इंस्टॉल करने और कानूनी रूप से Play Store पर पब्लिश करने की पूरी प्रक्रिया।',
  offlineBanner: 'ऑफलाइन मोड — सभी रोबोटिक्स लैब और कोडिंग टूल्स चालू हैं।',
  saveProgress: 'प्रोजेक्ट सेव करें',
  savedToast: 'प्रोजेक्ट डाउनलोड हो गया',
  xpLabel: 'लर्निंग XP',
  practicalsDoneLabel: 'पूर्ण प्रैक्टिकल',
  profileLabel: 'प्रोफ़ाइल',
  footerCopyright: 'HARRBOTIX · दुनिया भर के बच्चों के लिए मुफ़्त रोबोटिक्स और कोडिंग शिक्षा',
};

const partialTranslations: Record<Exclude<LanguageCode, 'en' | 'hi'>, Partial<TranslationStrings>> = {
  bn: {
    navOverview: 'হোম',
    navLab: 'রোবোটিক্স ল্যাব',
    navRover: 'রোভার এরিনা',
    navCoding: 'কোডিং স্টুডিও',
    navComponents: 'কম্পোনেন্টস',
    navPublish: 'অ্যাপ ও আইন',
    installApp: 'অ্যাপ ইনস্টল',
    heroTitle: 'শিশুদের জন্য বিনামূল্যে রোবোটিক্স এবং কম্পিউটার কোডিং ল্যাব',
    heroSubtitle: 'Android, iPhone এবং Windows-এ সেন্সর, মোটর, ব্লক কোডিং, Python এবং Arduino C++ শিখুন সম্পূর্ণ বিনামূল্যে।',
    startRoboticsBtn: 'রোবোটিক্স ল্যাব খুলুন',
    startCodingBtn: 'কোডিং স্টুডিও খুলুন',
    runPractical: 'প্র্যাকটিক্যাল চালান',
    runCode: 'কোড চালান',
    languageLabel: 'ভাষা',
  },
  ta: {
    navOverview: 'முகப்பு',
    navLab: 'ரோபாட்டிக்ஸ் ஆய்வகம்',
    navRover: 'ரோவர் அரங்கம்',
    navCoding: 'கோடிங் ஸ்டுடியோ',
    navComponents: 'கருவிகள்',
    navPublish: 'செயலி & சட்டம்',
    installApp: 'நிறுவுக',
    heroTitle: 'குழந்தைகளுக்கான இலவச ரோபாட்டிக்ஸ் மற்றும் கணினி நிரலாக்க ஆய்வகம்',
    heroSubtitle: 'Android, iPhone மற்றும் Windows இல் சென்சார்கள், மோட்டார்கள், பிளாக் கோடிங் மற்றும் Python கற்றுக்கொள்ளுங்கள்.',
    startRoboticsBtn: 'ஆய்வகத்தைத் திற',
    startCodingBtn: 'கோடிங் தொடங்கு',
    runPractical: 'இயக்கு',
    runCode: 'கோட் இயக்கு',
    languageLabel: 'மொழி',
  },
  te: {
    navOverview: 'హోమ్',
    navLab: 'రోబోటిక్స్ ల్యాబ్',
    navRover: 'రోవర్ అరీనా',
    navCoding: 'కోడింగ్ స్టూడియో',
    navComponents: 'భాగాలు',
    navPublish: 'యాప్ & చట్టం',
    installApp: 'యాప్ ఇన్‌స్టాల్',
    heroTitle: 'పిల్లల కోసం ఉచిత రోబోటిక్స్ మరియు కంప్యూటర్ కోడింగ్ ల్యాబ్',
    heroSubtitle: 'Android, iPhone మరియు Windows లో సెన్సార్లు, మోటార్లు, బ్లాక్ కోడింగ్ మరియు Python ఉచితంగా నేర్చుకోండి.',
    startRoboticsBtn: 'ల్యాబ్ తెరవండి',
    startCodingBtn: 'కోడింగ్ తెరవండి',
    runPractical: 'ప్రాక్టికల్ రన్ చేయండి',
    runCode: 'కోడ్ రన్ చేయండి',
    languageLabel: 'భాష',
  },
  mr: {
    navOverview: 'मुख्यपृष्ठ',
    navLab: 'रोबोटिक्स लॅब',
    navRover: 'रोव्हर अरीना',
    navCoding: 'कोडिंग स्टुडिओ',
    navComponents: 'घटक',
    navPublish: 'अ‍ॅप व कायदा',
    installApp: 'अ‍ॅप इंस्टॉल करा',
    heroTitle: 'मुलांसाठी मोफत रोबोटिक्स आणि संगणक कोडिंग कार्यशाळा',
    heroSubtitle: 'Android, iPhone आणि Windows वर सेन्सर, मोटर्स, ब्लॉक कोडिंग आणि Python मोफत शिका.',
    startRoboticsBtn: 'रोबोटिक्स लॅब उघडा',
    startCodingBtn: 'कोडिंग स्टुडिओ उघडा',
    runPractical: 'प्रॅक्टिकल चालवा',
    runCode: 'कोड चालवा',
    languageLabel: 'भाषा',
  },
  gu: {
    navOverview: 'હોમ',
    navLab: 'રોબોટિક્સ લેબ',
    navRover: 'રોવર એરેના',
    navCoding: 'કોડિંગ સ્ટુડિયો',
    navComponents: 'ઘટકો',
    navPublish: 'એપ અને કાયદો',
    installApp: 'એપ ઇન્સ્ટોલ',
    heroTitle: 'બાળકો માટે મફત રોબોટિક્સ અને કોમ્પ્યુટર કોડિંગ લેબ',
    heroSubtitle: 'Android, iPhone અને Windows પર સેન્સર્સ, મોટર્સ, બ્લોક કોડિંગ અને Python મફત શીખો.',
    startRoboticsBtn: 'લેબ ખોલો',
    startCodingBtn: 'કોડિંગ ખોલો',
    runPractical: 'પ્રયોગ ચલાવો',
    runCode: 'કોડ ચલાવો',
    languageLabel: 'ભાષા',
  },
  kn: {
    navOverview: 'ಮುಖಪುಟ',
    navLab: 'ರೋಬೋಟಿಕ್ಸ್ ಲ್ಯಾಬ್',
    navRover: 'ರೋವರ್ ಅರೇನಾ',
    navCoding: 'ಕೋಡಿಂಗ್ ಸ್ಟುಡಿಯೋ',
    navComponents: 'ಭಾಗಗಳು',
    navPublish: 'ಆ್ಯಪ್ ಮತ್ತು ನಿಯಮ',
    installApp: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್',
    heroTitle: 'ಮಕ್ಕಳಿಗಾಗಿ ಉಚಿತ ರೋಬೋಟಿಕ್ಸ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ ಕೋಡಿಂಗ್ ಪ್ರಯೋಗಾಲಯ',
    heroSubtitle: 'Android, iPhone ಮತ್ತು Windows ನಲ್ಲಿ ಸೆನ್ಸರ್‌ಗಳು, ಮೋಟಾರ್‌ಗಳು, ಬ್ಲಾಕ್ ಕೋಡಿಂಗ್ ಮತ್ತು Python ಕಲಿಯಿರಿ.',
    startRoboticsBtn: 'ಲ್ಯಾಬ್ ತೆರೆಯಿರಿ',
    startCodingBtn: 'ಕೋಡಿಂಗ್ ತೆರೆಯಿರಿ',
    runPractical: 'ಪ್ರಾಯೋಗಿಕ ಚಲಾಯಿಸಿ',
    runCode: 'ಕೋಡ್ ಚಲಾಯಿಸಿ',
    languageLabel: 'ಭಾಷೆ',
  },
  es: {
    navOverview: 'Inicio',
    navLab: 'Lab Robótica',
    navRover: 'Arena Rover',
    navCoding: 'Código',
    navComponents: 'Componentes',
    navPublish: 'App y Legal',
    installApp: 'Instalar App',
    heroTitle: 'Construye robots reales y aprende programación gratis',
    heroSubtitle: 'Taller interactivo STEM para niños en Android, iPhone y Windows. Conecta sensores, programa bloques visuales, Python, JavaScript y Arduino.',
    startRoboticsBtn: 'Abrir Lab Robótica',
    startCodingBtn: 'Abrir Estudio Código',
    runPractical: 'Ejecutar Práctica',
    runCode: 'Ejecutar Código',
    languageLabel: 'Idioma',
  },
  fr: {
    navOverview: 'Accueil',
    navLab: 'Labo Robotique',
    navRover: 'Arène Rover',
    navCoding: 'Studio Code',
    navComponents: 'Composants',
    navPublish: 'App & Légal',
    installApp: 'Installer',
    heroTitle: 'Construisez des robots et apprenez le code gratuitement',
    heroSubtitle: 'Atelier STEM interactif pour enfants sur Android, iPhone et Windows. Câblez des capteurs, codez en blocs, Python et Arduino.',
    startRoboticsBtn: 'Ouvrir Labo Robotique',
    startCodingBtn: 'Ouvrir Studio Code',
    runPractical: 'Lancer Pratique',
    runCode: 'Exécuter Code',
    languageLabel: 'Langue',
  },
  de: {
    navOverview: 'Start',
    navLab: 'Robotik-Labor',
    navRover: 'Rover-Arena',
    navCoding: 'Code-Studio',
    navComponents: 'Bauteile',
    navPublish: 'App & Recht',
    installApp: 'App Installieren',
    heroTitle: 'Echte Robotik-Experimente und Programmieren kostenlos lernen',
    heroSubtitle: 'Interaktive STEM-Werkstatt für Kinder auf Android, iPhone und Windows mit Sensoren, Motoren, Blöcken, Python und Arduino.',
    startRoboticsBtn: 'Robotik-Labor öffnen',
    startCodingBtn: 'Code-Studio öffnen',
    runPractical: 'Experiment starten',
    runCode: 'Code ausführen',
    languageLabel: 'Sprache',
  },
  ar: {
    navOverview: 'الرئيسية',
    navLab: 'مختبر الروبوتات',
    navRover: 'ساحة الروبوت',
    navCoding: 'استوديو البرمجة',
    navComponents: 'المكونات',
    navPublish: 'التطبيق والقانون',
    installApp: 'تثبيت التطبيق',
    heroTitle: 'اصنع الروبوتات وتعلم برمجة الحاسوب مجاناً للأطفال',
    heroSubtitle: 'ورشة عمل تفاعلية على أندرويد وآيفون وويندوز لتوصيل الحساسات والمحركات والبرمجة بالكتل وبايثون وأردوينو.',
    startRoboticsBtn: 'افتح مختبر الروبوتات',
    startCodingBtn: 'افتح استوديو البرمجة',
    runPractical: 'تشغيل التجربة',
    runCode: 'تشغيل الكود',
    languageLabel: 'اللغة',
  },
  zh: {
    navOverview: '首页',
    navLab: '机器人实验室',
    navRover: '小车竞技场',
    navCoding: '编程工作室',
    navComponents: '电子元件',
    navPublish: '应用与合规',
    installApp: '安装应用',
    heroTitle: '免费为孩子打造的机器人实验与计算机编程实验室',
    heroSubtitle: '支持 Android、iPhone 和 Windows。连接传感器与电机，拖拽积木块，并学习 Python、JavaScript 和 Arduino。',
    startRoboticsBtn: '打开机器人实验室',
    startCodingBtn: '打开编程工作室',
    runPractical: '运行实验',
    runCode: '运行代码',
    languageLabel: '语言',
  },
  ja: {
    navOverview: 'ホーム',
    navLab: 'ロボット実験室',
    navRover: 'ローバーアリーナ',
    navCoding: 'コーディング',
    navComponents: '部品図鑑',
    navPublish: 'アプリと法規',
    installApp: 'アプリを入手',
    heroTitle: '子ども向けの無料ロボット実習＆プログラミング教室',
    heroSubtitle: 'Android・iPhone・Windows対応。センサーやモーターを配線し、ブロックやPython・Arduinoを楽しく学べます。',
    startRoboticsBtn: 'ロボット実験室へ',
    startCodingBtn: 'プログラミングへ',
    runPractical: '実験を実行',
    runCode: 'コード実行',
    languageLabel: '言語',
  },
};

export function getTranslations(lang: LanguageCode): TranslationStrings {
  if (lang === 'en') return en;
  if (lang === 'hi') return hi;
  return { ...en, ...partialTranslations[lang] };
}
