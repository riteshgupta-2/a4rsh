import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  Code2,
  Compass,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  Loader2,
  MessageSquare,
  Navigation,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';
import { CODING_LESSONS } from '../data/codingData';
import { ROBOTICS_COMPONENTS, ROBOTICS_PRACTICALS } from '../data/roboticsData';
import { LanguageCode } from '../i18n/translations';
import { StudioTab } from './CodingStudio';

export type GuideTargetSection =
  | 'overview'
  | 'lab'
  | 'rover'
  | 'coding'
  | 'components'
  | 'publish';

type LearningTopicId =
  | 'overview'
  | 'lab'
  | 'rover'
  | 'coding'
  | 'components'
  | 'accounts';

interface TopicContent {
  id: LearningTopicId;
  targetSection?: GuideTargetSection;
  opensProfileModal?: boolean;
  label: string;
  labelHi: string;
  title: string;
  titleHi: string;
  summary: string;
  summaryHi: string;
  steps: string[];
  stepsHi: string[];
  concepts: { term: string; detail: string; termHi: string; detailHi: string }[];
  proTip: string;
  proTipHi: string;
  actionLabel: string;
  actionLabelHi: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

interface SearchCourseItem {
  id: string;
  kind: 'practical' | 'coding' | 'component' | 'guide';
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  badge: string;
  badgeHi: string;
  keywords: string;
  practicalId?: string;
  codingLessonId?: string;
  codingTab?: StudioTab;
  guideTopicId?: LearningTopicId;
  targetSection?: GuideTargetSection;
}

const LEARNING_TOPICS: TopicContent[] = [
  {
    id: 'overview',
    targetSection: 'overview',
    label: 'App Tour',
    labelHi: 'ऐप परिचय',
    title: 'Welcome to HARRBOTIX — Your Complete Robotics & Coding Studio',
    titleHi: 'HARRBOTIX में आपका स्वागत है — आपका रोबोटिक्स और कोडिंग स्टूडियो',
    summary:
      'HARRBOTIX lets you build electronic circuits, drive an autonomous sonar rover, code in 5 real languages, and earn XP certificates — 100% free and offline-ready on phone, tablet, or computer.',
    summaryHi:
      'HARRBOTIX में आप इलेक्ट्रॉनिक सर्किट जोड़ सकते हैं, सोनार रोवर चला सकते हैं, 5 असली भाषाओं में कोड लिख सकते हैं और XP सर्टिफिकेट पा सकते हैं — मुफ़्त और ऑफलाइन।',
    steps: [
      'Use the top navigation bar to jump between Robotics Lab, Rover Arena, Coding Studio, Components, and App & Legal.',
      'Check your active username, total XP, and practicals count in the bar right below the header.',
      'Click the circular avatar in the top-right corner anytime to create a cloud account or switch student profiles.',
      'Use "Save Project" to download a .json backup of your circuits, blocks, and progress.',
    ],
    stepsHi: [
      'ऊपर दिए गए नेविगेशन बार से Robotics Lab, Rover Arena, Coding Studio, Components और App & Legal खोलें।',
      'हेडर के नीचे अपना यूज़रनेम, XP और पूरे किए गए प्रैक्टिकल देखें।',
      'क्लाउड खाता बनाने या लोकल प्रोफ़ाइल बदलने के लिए ऊपर दाईं ओर गोल अवतार बटन दबाएँ।',
      '"Save Project" से अपने प्रोजेक्ट की .json बैकअप फ़ाइल सेव करें।',
    ],
    concepts: [
      {
        term: 'XP & Progress',
        detail: 'Earn +40 XP for completing Lab practicals and +50 XP for reaching Rover goals or finishing lessons.',
        termHi: 'XP और प्रगति',
        detailHi: 'प्रैक्टिकल पूरा करने पर +40 XP और रोवर लक्ष्य या कोडिंग पाठ पूरा करने पर +50 XP मिलते हैं।',
      },
      {
        term: '14 Languages + Offline PWA',
        detail: 'Switch interface languages anytime and install HARRBOTIX directly to your Home Screen or Desktop.',
        termHi: '14 भाषाएँ व ऑफलाइन PWA',
        detailHi: 'कभी भी भाषा बदलें और बिना इंटरनेट के चलाने के लिए ऐप इंस्टॉल करें।',
      },
    ],
    proTip: 'Every section has a floating Hint Box in the bottom-right corner that adapts to what you are clicking!',
    proTipHi: 'हर सेक्शन में नीचे दाईं ओर एक मदद बॉक्स है जो आपके वर्तमान कदम के अनुसार सुझाव देता है!',
    actionLabel: 'Explore Home Overview',
    actionLabelHi: 'होम पेज देखें',
  },
  {
    id: 'lab',
    targetSection: 'lab',
    label: 'Robotics Lab',
    labelHi: 'रोबोटिक्स लैब',
    title: 'Robotics Lab — Wire Circuits, Sensors & Real Arduino Pins',
    titleHi: 'रोबोटिक्स लैब — सर्किट वायरिंग, सेंसर और असली पिन सीखें',
    summary:
      'Practice 10 guided robotics builds or design your own in Free Sandbox mode. Connect components to Arduino Uno pins, trace wires clearly, test live voltage, and watch LEDs, servos, buzzers, and LCD screens come alive.',
    summaryHi:
      '10 गाइडेड प्रैक्टिकल सीखें या फ्री सैंडबॉक्स में खुद के सर्किट बनाएँ। Arduino Uno पिन जोड़ें और LED, सर्वो, बज़र व LCD को लाइव चलते देखें।',
    steps: [
      'Pick a guided Practical (like Traffic Signal or Ultrasonic Radar) or choose Free Sandbox.',
      'Click "+ Add Component" to place parts like LED, Servo Motor, Buzzer, HC-SR04 Ultrasonic Sensor, or LCD.',
      'Click any starting pin (e.g. D13 or 5V), then click the destination pin on another board to connect a colored wire.',
      'Turn on "Show Pin Tags" or hover any row in the Wire Connections Map to highlight exactly which pin goes where.',
      'Press "Run Practical" and use the live Environment Sliders (Distance cm, Light %, Temp °C, Button) to test responses.',
    ],
    stepsHi: [
      'ऊपर से कोई प्रैक्टिकल (जैसे Traffic Signal या Ultrasonic Radar) या Free Sandbox चुनें।',
      'LED, सर्वो मोटर, बज़र, अल्ट्रासोनिक सेंसर या LCD जोड़ने के लिए "+ Add Component" दबाएँ।',
      'किसी एक पिन (जैसे D13 या 5V) पर क्लिक करें, फिर तार जोड़ने के लिए दूसरे हिस्से की पिन चुनें।',
      'कौन-सा तार कहाँ जुड़ा है यह देखने के लिए "Show Pin Tags" चालू करें या Wire Connections Map पर माउस ले जाएँ।',
      '"Run Practical" दबाएँ और Distance, Light या Temp स्लाइडर बदलकर सर्किट टेस्ट करें।',
    ],
    concepts: [
      {
        term: 'VCC (5V) & GND',
        detail: 'VCC supplies positive +5V power; GND completes the circuit. Never connect 5V directly to GND or it causes a short circuit!',
        termHi: 'VCC (5V) और GND',
        detailHi: 'VCC से +5V बिजली मिलती है और GND सर्किट पूरा करता है। 5V को सीधे GND से कभी न जोड़ें।',
      },
      {
        term: 'Digital vs PWM (~)',
        detail: 'Digital pins switch ON/OFF (HIGH/LOW), while PWM pins (~3, ~5, ~6, ~9, ~10, ~11) control servo angles and motor speed.',
        termHi: 'Digital और PWM (~) पिन',
        detailHi: 'Digital पिन ON/OFF होती हैं, जबकि PWM पिन (~) सर्वो एंगल और मोटर स्पीड नियंत्रित करती हैं।',
      },
    ],
    proTip: 'Each wire automatically routes into its own numbered lane (#1, #2, #3...) so overlapping wires stay easy to trace.',
    proTipHi: 'हर तार अपने अलग नंबर वाले लेन (#1, #2, #3...) में दिखता है ताकि कोई तार आपस में उलझे नहीं।',
    actionLabel: 'Open Robotics Lab',
    actionLabelHi: 'रोबोटिक्स लैब खोलें',
  },
  {
    id: 'rover',
    targetSection: 'rover',
    label: 'Rover Arena',
    labelHi: 'रोवर एरीना',
    title: 'Rover Arena — Autonomous Navigation & Ultrasonic Sonar',
    titleHi: 'रोवर एरीना — स्मार्ट रोवर और अल्ट्रासोनिक सोनार',
    summary:
      'Drive a virtual wheeled robot across obstacle maps! Use manual D-pad controls, execute your own Coding Studio blocks, or activate Smart Sensor Navigation to automatically find the shortest safe path to the flag.',
    summaryHi:
      'बाधाओं से भरे ग्रिड पर अपना रोवर चलाएँ! मैनुअल बटन, कोडिंग ब्लॉक्स, या स्मार्ट सोनार नेविगेशन से झंडे तक का रास्ता खोजें।',
    steps: [
      'Choose a map (Maze, Obstacle Field, or Dual Corridor) and click any empty grid tiles to place or remove custom walls.',
      'Drag the "Sonar Detection Distance" slider (10 cm to 160 cm) to control how far ahead the blue ultrasonic beam scans.',
      'Click "Auto-Find & Avoid Walls" to let the rover steer around obstacles and stop right when it reaches the goal flag.',
      'Or press "Run Block Program" to run movement blocks you built in Coding Studio, with optional smart-navigation handoff.',
    ],
    stepsHi: [
      'कोई मैप चुनें और खाली ग्रिड सेल पर क्लिक करके खुद की दीवारें बनाएँ या हटाएँ।',
      '"Sonar Detection Distance" स्लाइडर (10–160 cm) से तय करें कि सोनार कितनी दूर तक बाधा पहचान सके।',
      '"Auto-Find & Avoid Walls" दबाकर रोवर को खुद रास्ता ढूँढकर झंडे तक पहुँचने दें।',
      'या Coding Studio में बनाए अपने ब्लॉक्स चलाने के लिए "Run Block Program" दबाएँ।',
    ],
    concepts: [
      {
        term: 'Ultrasonic Sonar Range',
        detail: 'Sound waves bounce off walls ahead. Longer cm range spots walls earlier so the rover turns smoothly before colliding.',
        termHi: 'अल्ट्रासोनिक सोनार रेंज',
        detailHi: 'आगे की दीवारों से ध्वनि तरंगें टकराकर लौटती हैं। ज़्यादा cm रेंज से रोवर पहले ही मुड़ जाता है।',
      },
      {
        term: 'Pathfinding + Goal Stop',
        detail: 'The rover maps reachable open cells toward the target flag (e.g. X:8 Y:1) and halts cleanly on arrival.',
        termHi: 'पाथफाइंडिंग व लक्ष्य स्टॉप',
        detailHi: 'रोवर झंडे तक सबसे सुरक्षित रास्ता खोजता है और लक्ष्य सेल पर पहुँचते ही रुक जाता है।',
      },
    ],
    proTip: 'Try blocking the rover’s path live while it is driving — watch the sonar beam detect your new wall and reroute!',
    proTipHi: 'रोवर चलते समय रास्ते में नई दीवार रखकर देखें — सोनार तुरंत नई बाधा देखकर रास्ता बदल लेगा!',
    actionLabel: 'Open Rover Arena',
    actionLabelHi: 'रोवर एरीना खोलें',
  },
  {
    id: 'coding',
    targetSection: 'coding',
    label: 'Coding Studio',
    labelHi: 'कोडिंग स्टूडियो',
    title: 'Coding Studio — Visual Blocks, Python, Web, JS & Arduino C++',
    titleHi: 'कोडिंग स्टूडियो — ब्लॉक्स, Python, HTML, JS और Arduino C++',
    summary:
      'Start by snapping colorful visual blocks together—then watch HARRBOTIX automatically translate your blocks into real Python, JavaScript, and Arduino C++! You can also write and run code directly in all 5 tabs.',
    summaryHi:
      'रंगीन कोडिंग ब्लॉक्स जोड़कर शुरुआत करें और देखें कि वे कैसे असली Python, JavaScript और Arduino C++ कोड में बदलते हैं।',
    steps: [
      'In the Visual Blocks tab, click blocks on the left (like Repeat, Move Forward, Rotate Servo, or Print) to build a sequence.',
      'Edit numbers/messages inline and use the ↑ / ↓ arrows to reorder steps, then watch the Generated Code preview update live.',
      'Switch to Python, HTML/CSS Web, JavaScript, or Arduino C++ tabs to explore starter lessons and run your own programs.',
      'Once you complete lessons or builds, click "Certificate" to generate a printable HARRBOTIX Academy certificate with your name.',
    ],
    stepsHi: [
      'Visual Blocks टैब में बाईं ओर से ब्लॉक्स (जैसे Repeat, Move Forward, Servo) चुनकर अपना प्रोग्राम बनाएँ।',
      'नंबर या टेक्स्ट बदलें, ↑/↓ से क्रम सेट करें और दाईं ओर रियल कोड बनते हुए देखें।',
      'Python, HTML/CSS, JavaScript या Arduino C++ टैब खोलकर आसान पाठ चुनें और "Run Code" से आउटपुट देखें।',
      'पाठ पूरे करके अपने नाम का HARRBOTIX सर्टिफिकेट बनाएँ और प्रिंट करें।',
    ],
    concepts: [
      {
        term: 'Transpilation (Blocks → Code)',
        detail: 'Every visual block maps to real syntax—for example, "Repeat 3x" becomes a `for` loop in Python, JS, and C++.',
        termHi: 'ब्लॉक्स से असली कोड',
        detailHi: 'हर ब्लॉक असली प्रोग्रामिंग सिंटैक्स बनाता है — जैसे "Repeat 3x" Python और C++ में `for` लूप बनता है।',
      },
      {
        term: 'setup() & loop() in Arduino',
        detail: 'In Arduino C++, `setup()` runs once when powered on, and `loop()` repeats forever to read sensors and move motors.',
        termHi: 'Arduino में setup() व loop()',
        detailHi: '`setup()` शुरुआत में एक बार चलता है और `loop()` सेंसर पढ़ने व मोटर चलाने के लिए लगातार दोहराता रहता है।',
      },
    ],
    proTip: 'Blocks you build in Coding Studio can be sent straight to the Rover Arena with the "Run on Rover" button!',
    proTipHi: 'Coding Studio के ब्लॉक्स को आप सीधे "Run on Rover" बटन से रोवर एरीना में चला सकते हैं!',
    actionLabel: 'Open Coding Studio',
    actionLabelHi: 'कोडिंग स्टूडियो खोलें',
  },
  {
    id: 'components',
    targetSection: 'components',
    label: 'Components',
    labelHi: 'इलेक्ट्रॉनिक हिस्से',
    title: 'Component Encyclopedia — Understand Real Electronics Parts',
    titleHi: 'कंपोनेंट गाइड — असली रोबोटिक्स पार्ट्स और पिन समझें',
    summary:
      'Browse illustrated profiles of essential robotics hardware: microcontrollers, ultrasonic sensors, photoresistors (LDR), servo & DC motors, buzzers, RGB LEDs, LCD displays, and push buttons.',
    summaryHi:
      'माइक्रोकंट्रोलर, अल्ट्रासोनिक सेंसर, LDR, सर्वो/DC मोटर, बज़र, RGB LED, LCD स्क्रीन और पुश बटन के बारे में विस्तार से जानें।',
    steps: [
      'Filter components by category (Microcontrollers, Sensors, Actuators, Indicators) or search by name.',
      'Read each part’s operating voltage, pin names (e.g. Trig, Echo, Signal, VCC, GND), and real-world robotics uses.',
      'Click "Try in Lab" on any component card to jump straight into a matching circuit practical in the Robotics Lab.',
    ],
    stepsHi: [
      'कैटेगरी फ़िल्टर या सर्च बॉक्स से किसी भी इलेक्ट्रॉनिक हिस्से को खोजें।',
      'हर हिस्से का वोल्टेज, पिन के नाम (Trig, Echo, VCC, GND) और वास्तविक उपयोग पढ़ें।',
      'किसी भी कार्ड पर "Try in Lab" दबाकर सीधे Robotics Lab में उसका प्रैक्टिकल आज़माएँ।',
    ],
    concepts: [
      {
        term: 'Sensors vs Actuators',
        detail: 'Sensors (Ultrasonic, LDR, Button) measure the world as inputs; Actuators (LED, Servo, Motor, Buzzer) act as outputs.',
        termHi: 'सेंसर और एक्चुएटर',
        detailHi: 'सेंसर (इनपुट) वातावरण को मापते हैं; एक्चुएटर (आउटपुट) जैसे मोटर, सर्वो व LED काम करके दिखाते हैं।',
      },
    ],
    proTip: 'Not sure what a pin on the circuit board does? Look it up here first, then click "Try in Lab"!',
    proTipHi: 'अगर किसी पिन का काम समझ न आए तो पहले यहाँ पढ़ें और फिर "Try in Lab" दबाएँ!',
    actionLabel: 'Browse Components',
    actionLabelHi: 'कंपोनेंट गाइड खोलें',
  },
  {
    id: 'accounts',
    targetSection: 'publish',
    opensProfileModal: true,
    label: 'Accounts & Install',
    labelHi: 'खाता और इंस्टॉल',
    title: 'Profiles, Cloud Accounts (Email · Phone · Apple ID) & App Install',
    titleHi: 'प्रोफ़ाइल, क्लाउड खाता और ऐप इंस्टॉलेशन',
    summary:
      'Keep separate student profiles offline on one shared device, or create a cloud account using Email, Phone Number (SMS OTP), Apple ID, or Google to save your XP and coding blocks securely.',
    summaryHi:
      'एक ही डिवाइस पर अलग-अलग लोकल छात्र प्रोफ़ाइल रखें, या Email, फ़ोन नंबर, Apple ID या Google से अपना क्लाउड खाता बनाएँ।',
    steps: [
      'Click the circular avatar in the top-right corner to open Account & Profiles.',
      'Use the "Account" tab to sign up with Email & Password, Phone SMS OTP, Apple ID, or Google.',
      'Or use the "Local Profiles" tab anytime offline to switch usernames and badge colors.',
      'Visit "App & Legal" to install HARRBOTIX on Android, iPhone/iPad, or Windows, or read the Terms & Privacy Policy.',
    ],
    stepsHi: [
      'ऊपर दाईं ओर गोल अवतार बटन पर क्लिक करके खाता व प्रोफ़ाइल विंडो खोलें।',
      'Email, फ़ोन OTP, Apple ID या Google से क्लाउड खाता बनाएँ या साइन इन करें।',
      'बिना इंटरनेट के ऑफलाइन छात्र नाम बदलने के लिए "Local Profiles" टैब का उपयोग करें।',
      'Android, iPhone या Windows पर इंस्टॉल करने और नियम व शर्तें पढ़ने के लिए "App & Legal" देखें।',
    ],
    concepts: [
      {
        term: 'Privacy-Isolated Accounts',
        detail: 'Your email/phone info stays isolated in private owner-only rules while offline mode stores everything on-device.',
        termHi: 'सुरक्षित व निजी डेटा',
        detailHi: 'ऑफलाइन मोड में सारा डेटा आपके डिवाइस में रहता है और क्लाउड खाते केवल मालिक द्वारा ही पढ़े जा सकते हैं।',
      },
    ],
    proTip: 'You can always use HARRBOTIX 100% free without logging in, or connect a cloud account later without losing local XP!',
    proTipHi: 'आप बिना लॉगिन के भी पूरा ऐप मुफ़्त चला सकते हैं, और बाद में खाता जोड़ने पर आपका लोकल XP भी सुरक्षित रहता है!',
    actionLabel: 'Open Account & Profiles',
    actionLabelHi: 'खाता व प्रोफ़ाइल खोलें',
  },
];

const QUICK_AI_QUESTIONS = [
  {
    en: 'Why should 5V never touch GND directly?',
    hi: '5V और GND को सीधे आपस में क्यों नहीं जोड़ना चाहिए?',
  },
  {
    en: 'How does the HC-SR04 Ultrasonic Sensor measure cm?',
    hi: 'अल्ट्रासोनिक सेंसर (HC-SR04) दूरी कैसे मापता है?',
  },
  {
    en: 'Explain Arduino setup() vs loop() simply',
    hi: 'Arduino में setup() और loop() का अंतर आसान भाषा में बताएं',
  },
  {
    en: 'Which Robotics course should a beginner start first?',
    hi: 'नए छात्र को सबसे पहले कौन सा रोबोटिक्स कोर्स शुरू करना चाहिए?',
  },
];

function renderFormattedInline(text: string): React.ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={idx}
          className="rounded-md border border-sky-200/80 bg-sky-50/90 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-sky-900"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{token}</React.Fragment>;
  });
}

function renderFormattedAiMessage(raw: string): React.ReactNode {
  const segments = raw.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-slate-800">
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const inner = segment.slice(3, -3).replace(/^[a-zA-Z0-9_+-]+\n/, '');
          return (
            <pre
              key={segIdx}
              className="overflow-x-auto rounded-xl border border-slate-700/60 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-sky-100"
            >
              <code>{inner.trim()}</code>
            </pre>
          );
        }

        const lines = segment
          .split('\n')
          .map((l) => l.trimEnd())
          .filter((l) => l.trim().length > 0);

        return lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
          const numberedMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
          const headingMatch = trimmed.match(/^#{1,3}\s+(.*)$/);

          if (headingMatch) {
            return (
              <p key={`${segIdx}-${lineIdx}`} className="font-bold text-slate-900 pt-1">
                {renderFormattedInline(headingMatch[1])}
              </p>
            );
          }

          if (bulletMatch) {
            return (
              <div key={`${segIdx}-${lineIdx}`} className="flex items-start gap-2 pl-1">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                <span>{renderFormattedInline(bulletMatch[1])}</span>
              </div>
            );
          }

          if (numberedMatch) {
            return (
              <div key={`${segIdx}-${lineIdx}`} className="flex items-start gap-2 pl-0.5">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sky-500/15 font-mono text-[10px] font-bold text-sky-800">
                  {numberedMatch[1]}
                </span>
                <span>{renderFormattedInline(numberedMatch[2])}</span>
              </div>
            );
          }

          return <p key={`${segIdx}-${lineIdx}`}>{renderFormattedInline(trimmed)}</p>;
        });
      })}
    </div>
  );
}

export const WavingHumanoidRobotSvg: React.FC<{ className?: string }> = ({
  className = 'h-12 w-12',
}) => (
  <svg
    viewBox="0 0 96 108"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <g className="robot-float-body">
      {/* Ground Soft Shadow */}
      <ellipse cx="46" cy="101" rx="22" ry="4" fill="rgba(15, 23, 42, 0.14)" />

      {/* Left Arm (Relaxed) */}
      <g>
        <rect x="17" y="49" width="9" height="22" rx="4.5" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
        <circle cx="21.5" cy="72" r="4" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.6" />
      </g>

      {/* Right Arm (Waving!) */}
      <g className="robot-wave-arm">
        <path
          d="M66 52 C74 44, 79 34, 81 24"
          stroke="#475569"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M66 52 C74 44, 79 34, 81 24"
          stroke="#F8FAFC"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Waving Hand */}
        <circle cx="82" cy="21" r="5.5" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.8" />
        <path d="M88 15 L91 12 M90 20 L94 19" stroke="#0284C7" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* Legs & Boots */}
      <rect x="33" y="76" width="9" height="16" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
      <rect x="50" y="76" width="9" height="16" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
      <rect x="30" y="90" width="13" height="7" rx="3.5" fill="#334155" />
      <rect x="49" y="90" width="13" height="7" rx="3.5" fill="#334155" />

      {/* Torso */}
      <rect x="27" y="45" width="38" height="33" rx="11" fill="#F8FAFC" stroke="#334155" strokeWidth="2.2" />
      {/* Chest Core Emblem */}
      <rect x="35" y="53" width="22" height="16" rx="6" fill="#0F172A" />
      <circle cx="46" cy="61" r="4.5" fill="#38BDF8" />
      <circle cx="46" cy="61" r="2" fill="#E0F2FE" />

      {/* Neck */}
      <rect x="41" y="39" width="10" height="7" rx="2.5" fill="#94A3B8" stroke="#475569" strokeWidth="1.6" />

      {/* Antenna */}
      <line x1="46" y1="12" x2="46" y2="5" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="46" cy="4" r="3" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.4" />

      {/* Head & Visor */}
      <rect x="26" y="12" width="40" height="29" rx="12" fill="#FFFFFF" stroke="#334155" strokeWidth="2.2" />
      {/* Ear Nodes */}
      <rect x="22" y="21" width="4" height="11" rx="2" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.4" />
      <rect x="66" y="21" width="4" height="11" rx="2" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.4" />
      {/* Dark Visor Screen */}
      <rect x="31" y="18" width="30" height="16" rx="7" fill="#0F172A" />
      {/* Friendly Blinking Eyes + Smile */}
      <g className="robot-eye-blink">
        <circle cx="40" cy="25" r="2.8" fill="#38BDF8" />
        <circle cx="52" cy="25" r="2.8" fill="#38BDF8" />
      </g>
      <path d="M42 30 Q46 33 50 30" stroke="#7DD3FC" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

interface RobotGuideWidgetProps {
  lang: LanguageCode;
  activeSection: GuideTargetSection;
  username: string;
  onNavigateSection: (section: GuideTargetSection) => void;
  onOpenPractical: (practicalId: string) => void;
  onOpenCodingTarget: (options: { tab?: StudioTab; lessonId?: string }) => void;
  onOpenAccountModal: () => void;
}

export const RobotGuideWidget: React.FC<RobotGuideWidgetProps> = ({
  lang,
  activeSection,
  username,
  onNavigateSection,
  onOpenPractical,
  onOpenCodingTarget,
  onOpenAccountModal,
}) => {
  const isHi = lang === 'hi';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<LearningTopicId>('overview');
  const [viewMode, setViewMode] = useState<'guide' | 'ai'>('guide');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (viewMode === 'ai' && isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiLoading, viewMode, isOpen]);

  // Build searchable catalog of all courses, practicals, coding tracks, components, and app guides
  const searchCatalog = useMemo<SearchCourseItem[]>(() => {
    const practicalItems: SearchCourseItem[] = ROBOTICS_PRACTICALS.map((p) => ({
      id: `prac-${p.id}`,
      kind: 'practical',
      title: p.title,
      titleHi: p.titleHi,
      subtitle: `${p.level} · ${p.duration} — ${p.description}`,
      subtitleHi: `${p.duration} — ${p.descriptionHi}`,
      badge: 'Robotics Course',
      badgeHi: 'रोबोटिक्स कोर्स',
      keywords: `${p.title} ${p.titleHi} ${p.description} ${p.descriptionHi} ${p.level} ${p.focusComponentId} arduino circuit lab practical`,
      practicalId: p.id,
      targetSection: 'lab',
    }));

    const codingItems: SearchCourseItem[] = [
      {
        id: 'code-blocks',
        kind: 'coding',
        title: '00. Visual Block Coding & Transpiler',
        titleHi: '00. विज़ुअल ब्लॉक कोडिंग कोर्स',
        subtitle: 'Beginner · Snap visual blocks and convert to Python, JS, & Arduino C++',
        subtitleHi: 'शुरुआती · रंगीन ब्लॉक्स से Python, JS और Arduino C++ बनाना सीखें',
        badge: 'Blocks Course',
        badgeHi: 'ब्लॉक्स कोर्स',
        keywords: 'visual blocks scratch block coding transpile rover loop repeat',
        codingTab: 'blocks',
        targetSection: 'coding',
      },
      ...CODING_LESSONS.map((lesson) => ({
        id: `lesson-${lesson.id}`,
        kind: 'coding' as const,
        title: lesson.title,
        titleHi: lesson.titleHi,
        subtitle: `${lesson.track.toUpperCase()} · +${lesson.xp} XP — ${lesson.goal}`,
        subtitleHi: `${lesson.track.toUpperCase()} · +${lesson.xp} XP — ${lesson.goalHi}`,
        badge: `${lesson.track.toUpperCase()} Course`,
        badgeHi: `${lesson.track.toUpperCase()} कोर्स`,
        keywords: `${lesson.title} ${lesson.titleHi} ${lesson.track} ${lesson.goal} ${lesson.goalHi} coding programming`,
        codingLessonId: lesson.id,
        codingTab: lesson.track,
        targetSection: 'coding' as GuideTargetSection,
      })),
    ];

    const componentItems: SearchCourseItem[] = ROBOTICS_COMPONENTS.map((comp) => {
      const matchingPractical = ROBOTICS_PRACTICALS.find(
        (p) => p.focusComponentId === comp.id
      );
      return {
        id: `comp-${comp.id}`,
        kind: 'component',
        title: comp.name,
        titleHi: comp.nameHi,
        subtitle: `${comp.voltage} — ${comp.summary}`,
        subtitleHi: `${comp.voltage} — ${comp.summaryHi}`,
        badge: 'Hardware Part',
        badgeHi: 'हार्डवेयर पार्ट',
        keywords: `${comp.name} ${comp.nameHi} ${comp.category} ${comp.summary} ${comp.summaryHi} ${comp.pins.map((pin) => pin.label).join(' ')}`,
        practicalId: matchingPractical?.id,
        targetSection: 'components',
      };
    });

    const guideItems: SearchCourseItem[] = LEARNING_TOPICS.map((topic) => ({
      id: `guide-${topic.id}`,
      kind: 'guide',
      title: topic.title,
      titleHi: topic.titleHi,
      subtitle: topic.summary,
      subtitleHi: topic.summaryHi,
      badge: 'App Guide',
      badgeHi: 'ऐप गाइड',
      keywords: `${topic.label} ${topic.labelHi} ${topic.title} ${topic.titleHi} ${topic.summary} ${topic.summaryHi} ${topic.concepts.map((c) => `${c.term} ${c.detail}`).join(' ')}`,
      guideTopicId: topic.id,
      targetSection: topic.targetSection,
    }));

    return [...practicalItems, ...codingItems, ...guideItems, ...componentItems];
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return searchCatalog
      .map((item) => {
        const haystack = `${item.title} ${item.titleHi} ${item.subtitle} ${item.subtitleHi} ${item.keywords}`.toLowerCase();
        const titleHaystack = `${item.title} ${item.titleHi}`.toLowerCase();
        let score = 0;
        for (const tok of tokens) {
          if (titleHaystack.includes(tok)) score += 3;
          else if (haystack.includes(tok)) score += 1;
        }
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((entry) => entry.item);
  }, [searchCatalog, searchQuery]);

  const handleOpenGuide = () => {
    const mapped: LearningTopicId =
      activeSection === 'publish' ? 'accounts' : activeSection;
    setSelectedTopicId(mapped);
    setIsOpen(true);
  };

  const askHarrE = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed || isAiLoading) return;

    setViewMode('ai');
    setSearchQuery('');
    setLastFailedPrompt(null);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const historyForApi = messages
      .filter((m) => !m.isError)
      .slice(-8)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setIsAiLoading(true);

    try {
      const res = await fetch('/api/ebot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyForApi,
          lang,
          activeTopic: selectedTopicId,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!res.ok || !data.reply) {
        throw new Error(
          data.error ||
            (isHi
              ? 'HARR-E AI अभी जवाब नहीं दे सका। कृपया पुनः प्रयास करें।'
              : 'HARR-E AI could not reply right now. Please try again.')
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `m_${Date.now()}`,
          role: 'model',
          text: data.reply as string,
        },
      ]);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error && err.message
          ? err.message
          : isHi
          ? 'कनेक्शन त्रुटि। कृपया दोबारा कोशिश करें।'
          : 'Connection error while contacting HARR-E AI.';
      setLastFailedPrompt(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          role: 'model',
          text: errMsg,
          isError: true,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setViewMode('ai');
      searchInputRef.current?.focus();
      return;
    }
    void askHarrE(searchQuery);
  };

  const handleSelectSearchItem = (item: SearchCourseItem) => {
    if (item.kind === 'practical' && item.practicalId) {
      setIsOpen(false);
      onOpenPractical(item.practicalId);
      return;
    }
    if (item.kind === 'coding') {
      setIsOpen(false);
      onOpenCodingTarget({
        lessonId: item.codingLessonId,
        tab: item.codingTab,
      });
      return;
    }
    if (item.kind === 'component') {
      setIsOpen(false);
      if (item.practicalId) {
        onOpenPractical(item.practicalId);
      } else {
        onNavigateSection('components');
      }
      return;
    }
    if (item.guideTopicId) {
      setSelectedTopicId(item.guideTopicId);
      setViewMode('guide');
      setSearchQuery('');
    }
  };

  const activeIndex = LEARNING_TOPICS.findIndex((t) => t.id === selectedTopicId);
  const topic = LEARNING_TOPICS[activeIndex >= 0 ? activeIndex : 0];

  const getTopicIcon = (id: LearningTopicId) => {
    switch (id) {
      case 'lab':
        return <Cpu className="h-3.5 w-3.5" aria-hidden="true" />;
      case 'rover':
        return <Navigation className="h-3.5 w-3.5" aria-hidden="true" />;
      case 'coding':
        return <Code2 className="h-3.5 w-3.5" aria-hidden="true" />;
      case 'components':
        return <Layers className="h-3.5 w-3.5" aria-hidden="true" />;
      case 'accounts':
        return <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />;
      case 'overview':
      default:
        return <Compass className="h-3.5 w-3.5" aria-hidden="true" />;
    }
  };

  const getSearchItemIcon = (kind: SearchCourseItem['kind']) => {
    switch (kind) {
      case 'practical':
        return <Wrench className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />;
      case 'coding':
        return <Code2 className="h-3.5 w-3.5 text-indigo-700" aria-hidden="true" />;
      case 'component':
        return <Cpu className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />;
      case 'guide':
      default:
        return <BookOpen className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />;
    }
  };

  return (
    <>
      {/* Bottom-Left Waving Humanoid Robot Trigger */}
      <button
        type="button"
        onClick={handleOpenGuide}
        aria-label={
          isHi
            ? 'HARR-E AI रोबोट खोलें, कोर्स खोजें या सवाल पूछें'
            : 'Open HARR-E AI Robot to search courses or ask any question'
        }
        title={isHi ? 'HARR-E AI से सीखें और कोर्स खोजें!' : 'Ask HARR-E AI or search courses!'}
        className="group fixed bottom-4 left-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-white/85 bg-white/65 p-1.5 sm:pr-4 text-left shadow-[0_14px_34px_rgba(2,132,199,0.2)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:border-sky-400/80 hover:bg-white/85 hover:shadow-[0_18px_40px_rgba(2,132,199,0.28)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
      >
        <span className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-sky-300/75 bg-gradient-to-br from-sky-400/20 via-white/75 to-emerald-400/15 shadow-inner overflow-hidden">
          <WavingHumanoidRobotSvg className="h-11 w-11 sm:h-12 sm:w-12" />
        </span>
        <span className="hidden sm:flex flex-col leading-tight">
          <span className="text-xs font-bold text-slate-900 group-hover:text-sky-800">
            {isHi ? 'HARR-E AI गाइड' : 'Ask HARR-E AI'}
          </span>
          <span className="text-[11px] font-medium text-slate-600">
            {isHi ? 'कोर्स खोजें व सीखें' : 'Search courses & ask'}
          </span>
        </span>
      </button>

      {/* Interactive AI Robot Teacher & Course Finder Screen */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="robot-guide-title"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl border border-white/85 bg-white/88 shadow-[0_28px_70px_rgba(15,23,42,0.26)] backdrop-blur-2xl overflow-hidden max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Teacher Header */}
            <div className="flex items-center justify-between gap-3 border-b border-white/75 bg-gradient-to-r from-sky-400/15 via-white/55 to-emerald-400/15 px-4 sm:px-5 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-full border border-sky-400/70 bg-white/85 shadow-sm">
                  <WavingHumanoidRobotSvg className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                    <GraduationCap className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{isHi ? 'HARR-E AI रोबोट टीचर' : 'HARR-E AI Robot Tutor'}</span>
                  </div>
                  <h3 id="robot-guide-title" className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {isHi
                      ? `नमस्ते ${username}! कोर्स खोजें या कुछ भी पूछें:`
                      : `Hi ${username}! Search courses or ask me anything:`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mode Toggle Capsules */}
                <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/45 p-1 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setViewMode('guide')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      viewMode === 'guide'
                        ? 'bg-sky-500/20 text-sky-950 border border-sky-400/70 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'कोर्स और गाइड' : 'Courses & Guide'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('ai')}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      viewMode === 'ai'
                        ? 'bg-sky-500/20 text-sky-950 border border-sky-400/70 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'AI चैट' : 'AI Chat'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label={isHi ? 'टीचर स्क्रीन बंद करें' : 'Close robot teacher'}
                  className="rounded-full border border-white/80 bg-white/45 p-2 text-slate-600 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 hover:text-slate-900 active:scale-95 shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Integrated Search Courses + Ask AI Bar */}
            <div className="border-b border-white/70 bg-white/55 px-4 sm:px-5 py-3 backdrop-blur-md space-y-2.5">
              <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      isHi
                        ? 'कोर्स खोजें (जैसे Python, Servo, Sonar) या अपना सवाल लिखें...'
                        : 'Search courses (Python, Ultrasonic, Rover) or ask anything you don’t understand...'
                    }
                    aria-label={isHi ? 'कोर्स खोजें या AI से पूछें' : 'Search courses or ask HARR-E AI'}
                    className="w-full rounded-full border border-white/90 bg-white/75 pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-inner backdrop-blur-md focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label={isHi ? 'खोज साफ़ करें' : 'Clear search'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-sky-400/80 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/35 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95 disabled:opacity-50 whitespace-nowrap"
                >
                  {isAiLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{isHi ? 'HARR-E AI से पूछें' : 'Ask HARR-E AI'}</span>
                </button>
              </form>

              {/* Mobile Mode Switcher */}
              <div className="flex sm:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('guide')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    viewMode === 'guide'
                      ? 'border-sky-400/75 bg-sky-500/20 text-sky-950'
                      : 'border-white/80 bg-white/40 text-slate-600'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isHi ? 'कोर्स गाइड' : 'Courses & Guide'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('ai')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    viewMode === 'ai'
                      ? 'border-sky-400/75 bg-sky-500/20 text-sky-950'
                      : 'border-white/80 bg-white/40 text-slate-600'
                  }`}
                >
                  <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isHi ? 'AI टीचर चैट' : 'AI Tutor Chat'}</span>
                </button>
              </div>

              {/* Live Course & Feature Search Results Dropdown */}
              {searchQuery.trim().length > 0 && (
                <div className="rounded-2xl border border-sky-200/80 bg-white/90 p-2.5 shadow-md space-y-2 max-h-56 overflow-y-auto">
                  <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-500">
                    <span>
                      {searchResults.length > 0
                        ? isHi
                          ? `मिलते-जुलते कोर्स व पाठ (${searchResults.length})`
                          : `Matching Courses & Topics (${searchResults.length})`
                        : isHi
                        ? 'कोई सीधा कोर्स नहीं मिला — नीचे AI से पूछें दबाएँ!'
                        : 'No exact course title match — click "Ask HARR-E AI" to get an AI explanation!'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void askHarrE(searchQuery)}
                      className="inline-flex items-center gap-1 rounded-full border border-sky-300/80 bg-sky-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-sky-900 hover:bg-sky-500/30"
                    >
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      <span>{isHi ? `"${searchQuery.slice(0, 18)}" AI से समझें` : `Explain "${searchQuery.slice(0, 18)}" with AI`}</span>
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectSearchItem(item)}
                          className="group flex items-start justify-between gap-2 rounded-xl border border-slate-200/80 bg-white/80 p-2.5 text-left transition-all hover:border-sky-400 hover:bg-sky-50/75 hover:shadow-sm"
                        >
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                              {getSearchItemIcon(item.kind)}
                              <span>{isHi ? item.badgeHi : item.badge}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-900">
                              {isHi ? item.titleHi : item.title}
                            </p>
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              {isHi ? item.subtitleHi : item.subtitle}
                            </p>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-sky-700 mt-1" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* VIEW 1: AI TUTOR CONVERSATION */}
            {viewMode === 'ai' ? (
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {messages.length === 0 ? (
                  <div className="rounded-2xl border border-white/85 bg-white/70 p-4 sm:p-5 space-y-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-300/80 bg-sky-500/15 text-sky-800">
                        <Bot className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-900">
                          {isHi
                            ? 'HARR-E AI आपका व्यक्तिगत रोबोटिक्स व कोडिंग टीचर है!'
                            : 'Ask HARR-E AI anything you find confusing!'}
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-600">
                          {isHi
                            ? 'चाहे वह Arduino पिन वायरिंग हो, Python लूप हो, सोनार सेंसर हो या रोवर लॉजिक — ऊपर लिखें या नीचे कोई सवाल चुनें।'
                            : 'Ask about circuit wiring, Arduino pins, Python loops, HTML/CSS, JavaScript, sensors, or which course to take next.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-slate-500">
                        {isHi ? 'त्वरित सवाल चुनें:' : 'Popular questions to try:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_AI_QUESTIONS.map((q, i) => {
                          const label = isHi ? q.hi : q.en;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => void askHarrE(label)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/75 bg-sky-500/12 px-3.5 py-1.5 text-left text-xs font-semibold text-sky-950 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/25 active:scale-95"
                            >
                              <Sparkles className="h-3 w-3 shrink-0 text-sky-600" aria-hidden="true" />
                              <span>{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isHi ? 'HARR-E AI संवाद' : 'Conversation with HARR-E AI'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setMessages([]);
                          setLastFailedPrompt(null);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/50 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white hover:text-slate-900"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                        <span>{isHi ? 'चैट साफ़ करें' : 'Clear Chat'}</span>
                      </button>
                    </div>

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm ${
                            msg.role === 'user'
                              ? 'border border-sky-400/70 bg-sky-500/20 text-slate-900 rounded-br-md'
                              : msg.isError
                              ? 'border border-rose-300/80 bg-rose-50/90 text-rose-900 rounded-bl-md'
                              : 'border border-white/90 bg-white/85 text-slate-800 rounded-bl-md'
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            {msg.role === 'user' ? (
                              <span>{username}</span>
                            ) : (
                              <>
                                <Bot className="h-3.5 w-3.5 text-sky-700" aria-hidden="true" />
                                <span className="text-sky-800">HARR-E AI</span>
                              </>
                            )}
                          </div>
                          {msg.role === 'user' ? (
                            <p className="text-xs sm:text-[13px] font-medium text-slate-900">
                              {msg.text}
                            </p>
                          ) : (
                            renderFormattedAiMessage(msg.text)
                          )}
                        </div>
                      </div>
                    ))}

                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="inline-flex items-center gap-2 rounded-2xl border border-white/90 bg-white/80 px-4 py-2.5 text-xs font-semibold text-sky-900 shadow-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-sky-600" aria-hidden="true" />
                          <span>{isHi ? 'HARR-E सोच रहा है...' : 'HARR-E AI is thinking...'}</span>
                        </div>
                      </div>
                    )}

                    {lastFailedPrompt && !isAiLoading && (
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={() => void askHarrE(lastFailedPrompt)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-900 hover:bg-rose-100"
                        >
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{isHi ? 'पुनः प्रयास करें' : 'Retry Question'}</span>
                        </button>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </div>
            ) : (
              /* VIEW 2: TOPIC & COURSE GUIDE */
              <>
                {/* Topic Selector Strip */}
                <div className="border-b border-white/60 bg-white/45 px-4 sm:px-5 py-3 backdrop-blur-sm">
                  <p className="mb-2 text-[11px] font-semibold text-slate-600">
                    {isHi ? 'सीखने के लिए विषय चुनें:' : 'Select what you want to learn about:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {LEARNING_TOPICS.map((item) => {
                      const active = item.id === topic.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTopicId(item.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                            active
                              ? 'border-sky-400/85 bg-sky-500/20 text-sky-950 shadow-[0_4px_14px_rgba(2,132,199,0.2)]'
                              : 'border-white/80 bg-white/40 text-slate-700 hover:border-sky-300/80 hover:bg-white/75 hover:text-slate-900'
                          }`}
                        >
                          {getTopicIcon(item.id)}
                          <span>{isHi ? item.labelHi : item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scrollable Lesson Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  <div className="rounded-2xl border border-white/80 bg-white/65 p-4 backdrop-blur-md shadow-sm space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                        <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{isHi ? 'पाठ का सार' : 'Lesson Overview'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void askHarrE(
                            isHi
                              ? `${topic.labelHi} के बारे में मुझे आसान शब्दों में सिखाएं और बताएं कि शुरुआत कैसे करें।`
                              : `Teach me ${topic.label} in simple steps and suggest a fun beginner project!`
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/75 bg-sky-500/15 px-3 py-1 text-[11px] font-semibold text-sky-950 transition-all hover:-translate-y-0.5 hover:bg-sky-500/30"
                      >
                        <MessageSquare className="h-3 w-3" aria-hidden="true" />
                        <span>{isHi ? `AI से ${topic.labelHi} पूछें` : `Ask AI about ${topic.label}`}</span>
                      </button>
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {isHi ? topic.titleHi : topic.title}
                    </h4>
                    <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
                      {isHi ? topic.summaryHi : topic.summary}
                    </p>
                  </div>

                  {/* Quick Direct Courses Preview for Lab & Coding */}
                  {(topic.id === 'lab' || topic.id === 'coding') && (
                    <div className="rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-md space-y-2.5">
                      <h5 className="text-xs font-bold text-slate-900">
                        {topic.id === 'lab'
                          ? isHi
                            ? 'लोकप्रिय रोबोटिक्स लैब कोर्स सीधे खोलें:'
                            : 'Popular Robotics Courses (Click to Open):'
                          : isHi
                          ? 'लोकप्रिय कोडिंग कोर्स सीधे खोलें:'
                          : 'Popular Coding Courses (Click to Open):'}
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {topic.id === 'lab'
                          ? ROBOTICS_PRACTICALS.slice(0, 5).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  onOpenPractical(p.id);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-sky-300/75 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-950 transition-all"
                              >
                                <Wrench className="h-3 w-3 text-sky-700" aria-hidden="true" />
                                <span>{isHi ? p.titleHi : p.title}</span>
                              </button>
                            ))
                          : CODING_LESSONS.map((l) => (
                              <button
                                key={l.id}
                                type="button"
                                onClick={() => {
                                  setIsOpen(false);
                                  onOpenCodingTarget({ lessonId: l.id, tab: l.track });
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300/75 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-950 transition-all"
                              >
                                <Code2 className="h-3 w-3 text-indigo-700" aria-hidden="true" />
                                <span>{isHi ? l.titleHi : l.title}</span>
                              </button>
                            ))}
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Walkthrough */}
                  <div className="rounded-2xl border border-white/80 bg-white/60 p-4 backdrop-blur-md space-y-2.5">
                    <h5 className="text-xs font-bold text-slate-900">
                      {isHi ? 'कदम-दर-कदम कैसे चलाएँ' : 'How to Use It Step-by-Step'}
                    </h5>
                    <ol className="space-y-2">
                      {(isHi ? topic.stepsHi : topic.steps).map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-700">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-sky-400/70 bg-sky-500/15 font-mono text-[10px] font-bold text-sky-900">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Key Concepts Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {topic.concepts.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/80 bg-white/55 p-3.5 backdrop-blur-sm space-y-1"
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                          <Sparkles className="h-3.5 w-3.5 text-sky-600 shrink-0" aria-hidden="true" />
                          <span>{isHi ? c.termHi : c.term}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600">
                          {isHi ? c.detailHi : c.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="rounded-2xl border border-amber-300/75 bg-amber-400/15 p-3.5 text-xs leading-relaxed text-amber-950 flex items-start gap-2.5">
                    <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <strong className="font-bold">
                        {isHi ? 'HARR-E प्रो टिप: ' : 'HARR-E Pro Tip: '}
                      </strong>
                      <span>{isHi ? topic.proTipHi : topic.proTip}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Footer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/70 bg-white/60 px-4 sm:px-5 py-3 backdrop-blur-md">
              {viewMode === 'ai' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setViewMode('guide')}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/45 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85 active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'कोर्स गाइड पर लौटें' : 'Back to Course Guide'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => searchInputRef.current?.focus()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/80 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 active:scale-95"
                  >
                    <Search className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'नया सवाल पूछें या कोर्स खोजें' : 'Ask Follow-up or Search'}</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeIndex <= 0}
                      onClick={() =>
                        setSelectedTopicId(LEARNING_TOPICS[Math.max(0, activeIndex - 1)].id)
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/40 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{isHi ? 'पिछला' : 'Previous'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={activeIndex >= LEARNING_TOPICS.length - 1}
                      onClick={() =>
                        setSelectedTopicId(
                          LEARNING_TOPICS[Math.min(LEARNING_TOPICS.length - 1, activeIndex + 1)].id
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/40 px-3.5 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                    >
                      <span>{isHi ? 'अगला' : 'Next'}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span className="hidden sm:inline text-[11px] font-medium text-slate-500 tabular-nums ml-1">
                      {activeIndex + 1} / {LEARNING_TOPICS.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (topic.opensProfileModal) {
                        onOpenAccountModal();
                      } else if (topic.targetSection) {
                        onNavigateSection(topic.targetSection);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-sky-400/80 bg-sky-500/20 px-5 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/35 hover:shadow-[0_6px_18px_rgba(2,132,199,0.24)] active:scale-95"
                  >
                    <span>{isHi ? topic.actionLabelHi : topic.actionLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
