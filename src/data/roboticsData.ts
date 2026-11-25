export type ComponentCategory =
  | 'controller'
  | 'sensor'
  | 'actuator'
  | 'display'
  | 'power';

export type PinType = 'power' | 'ground' | 'digital' | 'analog' | 'pwm' | 'i2c';

export interface ComponentPin {
  id: string;
  label: string;
  rx: number; // relative x inside SVG box
  ry: number; // relative y inside SVG box
  type: PinType;
}

export interface RoboticsComponentDef {
  id: string;
  name: string;
  nameHi: string;
  category: ComponentCategory;
  voltage: string;
  width: number;
  height: number;
  summary: string;
  summaryHi: string;
  safetyTip: string;
  realWorldUse: string;
  pins: ComponentPin[];
}

export interface PlacedComponent {
  instanceId: string;
  defId: string;
  x: number;
  y: number;
  label?: string;
  colorVariant?: 'red' | 'amber' | 'emerald' | 'sky';
}

export interface WireConnection {
  id: string;
  fromInstanceId: string;
  fromPinId: string;
  toInstanceId: string;
  toPinId: string;
  color: string;
}

export interface PracticalEnvState {
  distanceCm: number;
  lightPercent: number;
  temperatureC: number;
  humidityPercent: number;
  moisturePercent: number;
  potentiometerPercent: number;
  buttonPressed: boolean;
  irDetected: boolean;
}

export interface PracticalSimulationResult {
  ledStates: Record<string, boolean>;
  ledBrightness: Record<string, number>;
  servoAngle: number;
  motorRpm: number;
  buzzerFreq: number;
  relayClosed: boolean;
  lcdLine1: string;
  lcdLine2: string;
  sevenSegChar: string;
  pinStates: { pin: string; state: string; voltage: string; active: boolean }[];
  serialLogs: string[];
}

export interface RoboticsPractical {
  id: string;
  title: string;
  titleHi: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  focusComponentId: string;
  description: string;
  descriptionHi: string;
  steps: string[];
  stepsHi: string[];
  requiredSensors: (keyof PracticalEnvState)[];
  components: PlacedComponent[];
  wires: WireConnection[];
  simulate: (env: PracticalEnvState, tick: number) => PracticalSimulationResult;
  arduinoCode: string;
}

export const ROBOTICS_COMPONENTS: RoboticsComponentDef[] = [
  {
    id: 'arduino_uno',
    name: 'Arduino Uno R3',
    nameHi: 'आर्डुइनो ऊनो R3',
    category: 'controller',
    voltage: '5V Logic · 7-12V Input',
    width: 190,
    height: 135,
    summary: 'Popular 8-bit microcontroller brain with 14 digital I/O pins and 6 analog inputs for robotics.',
    summaryHi: 'रोबोटिक्स का सबसे लोकप्रिय माइक्रोकंट्रोलर बोर्ड, जिसमें 14 डिजिटल और 6 एनालॉग पिन होती हैं।',
    safetyTip: 'Never connect motor power directly to 5V logic pins without a driver or relay.',
    realWorldUse: 'Smart dustbins, traffic lights, line-following robots, home automation.',
    pins: [
      { id: '5V', label: '5V', rx: 32, ry: 125, type: 'power' },
      { id: 'GND', label: 'GND', rx: 64, ry: 125, type: 'ground' },
      { id: 'A0', label: 'A0', rx: 108, ry: 125, type: 'analog' },
      { id: 'A1', label: 'A1', rx: 140, ry: 125, type: 'analog' },
      { id: 'D2', label: 'D2', rx: 30, ry: 10, type: 'digital' },
      { id: 'D5', label: 'D5~', rx: 66, ry: 10, type: 'pwm' },
      { id: 'D9', label: 'D9~', rx: 104, ry: 10, type: 'pwm' },
      { id: 'D12', label: 'D12', rx: 138, ry: 10, type: 'digital' },
      { id: 'D13', label: 'D13', rx: 168, ry: 10, type: 'digital' },
    ],
  },
  {
    id: 'esp32',
    name: 'ESP32 WiFi & BLE Board',
    nameHi: 'ESP32 वाई-फाई बोर्ड',
    category: 'controller',
    voltage: '3.3V Logic · USB 5V',
    width: 175,
    height: 125,
    summary: 'Dual-core wireless microcontroller with built-in Wi-Fi and Bluetooth for IoT and phone-controlled robots.',
    summaryHi: 'बिल्ट-इन वाई-फाई और ब्लूटूथ वाला तेज़ माइक्रोकंट्रोलर, इंटरनेट और मोबाइल रोबोट के लिए।',
    safetyTip: 'ESP32 GPIO pins operate at 3.3V maximum; use resistors when interfacing 5V sensors.',
    realWorldUse: 'Wi-Fi weather stations, smart irrigation, Bluetooth rover controllers.',
    pins: [
      { id: '3V3', label: '3.3V', rx: 28, ry: 115, type: 'power' },
      { id: 'GND', label: 'GND', rx: 64, ry: 115, type: 'ground' },
      { id: 'GPIO4', label: 'IO4', rx: 106, ry: 115, type: 'analog' },
      { id: 'GPIO18', label: 'IO18', rx: 56, ry: 10, type: 'digital' },
      { id: 'GPIO21', label: 'SDA', rx: 104, ry: 10, type: 'i2c' },
      { id: 'GPIO22', label: 'SCL', rx: 144, ry: 10, type: 'i2c' },
    ],
  },
  {
    id: 'microbit',
    name: 'BBC micro:bit V2',
    nameHi: 'BBC माइक्रो:बिट V2',
    category: 'controller',
    voltage: '3.3V · Built-in 5x5 LED Matrix',
    width: 155,
    height: 120,
    summary: 'Kid-friendly pocket computer featuring a 5x5 LED grid, compass, accelerometer, and touch logo.',
    summaryHi: 'बच्चों के लिए बना मिनी कंप्यूटर जिसमें 25 LED स्क्रीन, बटन और मोशन सेंसर लगा होता है।',
    safetyTip: 'Hold the edges of the board to avoid static discharge on the gold pins.',
    realWorldUse: 'Step counters, wireless doorbell alarms, interactive classroom games.',
    pins: [
      { id: 'P0', label: 'P0', rx: 28, ry: 110, type: 'digital' },
      { id: 'P1', label: 'P1', rx: 64, ry: 110, type: 'analog' },
      { id: 'P2', label: 'P2', rx: 100, ry: 110, type: 'pwm' },
      { id: 'GND', label: 'GND', rx: 134, ry: 110, type: 'ground' },
    ],
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic Sensor (HC-SR04)',
    nameHi: 'अल्ट्रासोनिक दूरी सेंसर',
    category: 'sensor',
    voltage: '5V DC · Range 2cm–400cm',
    width: 140,
    height: 82,
    summary: 'Measures distance like a bat using high-frequency sound waves (Trig sends ping, Echo listens).',
    summaryHi: 'चमगादड़ की तरह आवाज़ की तरंगों से सामने की वस्तु की दूरी (2cm से 400cm) मापता है।',
    safetyTip: 'Keep sensor lenses clean and unobstructed for accurate sonar readings.',
    realWorldUse: 'Car parking radar, obstacle-avoiding robots, smart water tank gauges.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 26, ry: 74, type: 'power' },
      { id: 'TRIG', label: 'TRIG', rx: 58, ry: 74, type: 'digital' },
      { id: 'ECHO', label: 'ECHO', rx: 92, ry: 74, type: 'digital' },
      { id: 'GND', label: 'GND', rx: 120, ry: 74, type: 'ground' },
    ],
  },
  {
    id: 'ir_sensor',
    name: 'IR Obstacle & Line Sensor',
    nameHi: 'IR ऑब्स्टैकल व लाइन सेंसर',
    category: 'sensor',
    voltage: '3.3V–5V DC · Digital Out',
    width: 120,
    height: 70,
    summary: 'Detects nearby objects or black vs. white surface lines using invisible infrared light.',
    summaryHi: 'अदृश्य इन्फ्रारेड किरणों से सामने की बाधा या काली-सफेद लाइन को पहचानता है।',
    safetyTip: 'Strong sunlight contains IR and may trigger false detections outdoors.',
    realWorldUse: 'Line-following competition robots, touchless hand sanitizers, automatic doors.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 24, ry: 62, type: 'power' },
      { id: 'GND', label: 'GND', rx: 60, ry: 62, type: 'ground' },
      { id: 'OUT', label: 'OUT', rx: 96, ry: 62, type: 'digital' },
    ],
  },
  {
    id: 'ldr_sensor',
    name: 'LDR Light Sensor',
    nameHi: 'LDR प्रकाश सेंसर',
    category: 'sensor',
    voltage: '3.3V–5V · Analog Light Value',
    width: 110,
    height: 68,
    summary: 'Photoresistor whose resistance drops as brightness increases, letting robots see day vs. night.',
    summaryHi: 'यह सेंसर रोशनी को महसूस करता है ताकि रोबोट दिन और रात का अंतर समझ सके।',
    safetyTip: 'Always pair a bare LDR with a 10kΩ resistor in a voltage divider circuit.',
    realWorldUse: 'Automatic solar street lights, sunlight-tracking solar panels.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 22, ry: 60, type: 'power' },
      { id: 'AO', label: 'AO', rx: 56, ry: 60, type: 'analog' },
      { id: 'GND', label: 'GND', rx: 88, ry: 60, type: 'ground' },
    ],
  },
  {
    id: 'dht11',
    name: 'DHT11 Temp & Humidity Sensor',
    nameHi: 'DHT11 तापमान व नमी सेंसर',
    category: 'sensor',
    voltage: '3.3V–5V · 0°C to 50°C',
    width: 112,
    height: 82,
    summary: 'Measures room temperature in Celsius and relative humidity percentage digitally.',
    summaryHi: 'कमरे का तापमान (°C) और हवा की नमी (%) को डिजिटल रूप से मापता है।',
    safetyTip: 'Do not immerse the blue sensor casing in water.',
    realWorldUse: 'Smart greenhouse monitors, classroom weather stations, fever/heat alerts.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 24, ry: 74, type: 'power' },
      { id: 'DATA', label: 'DATA', rx: 56, ry: 74, type: 'digital' },
      { id: 'GND', label: 'GND', rx: 88, ry: 74, type: 'ground' },
    ],
  },
  {
    id: 'soil_sensor',
    name: 'Soil Moisture Sensor',
    nameHi: 'मिट्टी की नमी सेंसर',
    category: 'sensor',
    voltage: '3.3V–5V · Analog 0–100%',
    width: 110,
    height: 86,
    summary: 'Detects how wet or dry plant soil is by measuring electrical conductivity between two probes.',
    summaryHi: 'पौधे की मिट्टी सूखी है या गीली, यह जांचकर ऑटोमैटिक पानी देने में मदद करता है।',
    safetyTip: 'Disconnect power when cleaning probes to prevent corrosion.',
    realWorldUse: 'Automated garden watering, smart farming systems.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 22, ry: 78, type: 'power' },
      { id: 'AO', label: 'AO', rx: 56, ry: 78, type: 'analog' },
      { id: 'GND', label: 'GND', rx: 88, ry: 78, type: 'ground' },
    ],
  },
  {
    id: 'potentiometer',
    name: 'Rotary Potentiometer Knob',
    nameHi: 'रोटरी नॉब (पोटेंशियोमीटर)',
    category: 'sensor',
    voltage: '0–5V Variable Analog',
    width: 96,
    height: 82,
    summary: 'Adjustable dial resistor used as a manual speed controller, dimmer, or angle selector.',
    summaryHi: 'गोल घुमाने वाला बटन जिससे मोटर की स्पीड या लाइट की चमक कम-ज़्यादा की जाती है।',
    safetyTip: 'Do not force the dial past its mechanical stop.',
    realWorldUse: 'Volume knobs, robot arm joint control, fan speed regulators.',
    pins: [
      { id: 'VCC', label: '5V', rx: 20, ry: 74, type: 'power' },
      { id: 'SIG', label: 'SIG', rx: 48, ry: 74, type: 'analog' },
      { id: 'GND', label: 'GND', rx: 76, ry: 74, type: 'ground' },
    ],
  },
  {
    id: 'push_button',
    name: 'Tactile Push Button',
    nameHi: 'पुश बटन स्विच',
    category: 'sensor',
    voltage: 'Digital High / Low',
    width: 84,
    height: 70,
    summary: 'Momentary switch that closes a circuit while pressed to send a start or SOS signal.',
    summaryHi: 'दबाने पर सर्किट को जोड़ने वाला बटन स्विच, रोबोट चालू करने या सिग्नल भेजने के लिए।',
    safetyTip: 'Use INPUT_PULLUP in code to prevent floating random readings.',
    realWorldUse: 'Doorbells, game controllers, emergency stop buttons.',
    pins: [
      { id: 'IN', label: 'SIG', rx: 22, ry: 62, type: 'digital' },
      { id: 'GND', label: 'GND', rx: 62, ry: 62, type: 'ground' },
    ],
  },
  {
    id: 'servo_motor',
    name: 'SG90 Micro Servo Motor',
    nameHi: 'SG90 सर्वो मोटर (0–180°)',
    category: 'actuator',
    voltage: '5V · PWM Angle 0°–180°',
    width: 120,
    height: 92,
    summary: 'Precision geared motor that rotates to any exact angle between 0 and 180 degrees.',
    summaryHi: 'सटीक कोण (0° से 180°) पर घूमने वाली मोटर, रोबोटिक हाथ और स्मार्ट गेट बनाने के लिए।',
    safetyTip: 'Never twist the plastic servo horn by hand while powered on.',
    realWorldUse: 'Robotic arms, automatic toll gates, radar scanner mounts.',
    pins: [
      { id: 'SIG', label: 'PWM', rx: 26, ry: 84, type: 'pwm' },
      { id: 'VCC', label: '5V', rx: 60, ry: 84, type: 'power' },
      { id: 'GND', label: 'GND', rx: 94, ry: 84, type: 'ground' },
    ],
  },
  {
    id: 'dc_motor',
    name: 'DC Geared Motor + Wheel',
    nameHi: 'DC गियर मोटर व पहिया',
    category: 'actuator',
    voltage: '3V–9V · Variable RPM',
    width: 124,
    height: 92,
    summary: 'Spins rover wheels forward or backward; speed increases with PWM voltage.',
    summaryHi: 'रोबोट कार के पहियों को आगे-पीछे घुमाने वाली तेज़ मोटर।',
    safetyTip: 'Use an L298N motor driver or transistor with Arduino to protect GPIO pins.',
    realWorldUse: 'Robot rovers, conveyor belts, cooling fans.',
    pins: [
      { id: 'POS', label: 'M+', rx: 36, ry: 84, type: 'pwm' },
      { id: 'NEG', label: 'M-', rx: 88, ry: 84, type: 'ground' },
    ],
  },
  {
    id: 'buzzer',
    name: 'Active Piezo Buzzer',
    nameHi: 'पीज़ो बज़र (अलार्म स्पीकर)',
    category: 'actuator',
    voltage: '3.3V–5V · Audio Tone',
    width: 90,
    height: 76,
    summary: 'Produces clear beeps, alerts, and musical frequencies when driven by digital or tone signals.',
    summaryHi: 'बीप की आवाज़, अलार्म और संगीत की धुन बजाने वाला छोटा स्पीकर।',
    safetyTip: 'Check + and - polarity before powering.',
    realWorldUse: 'Reverse parking alarms, Morse code transmitters, fire alerts.',
    pins: [
      { id: 'POS', label: '+', rx: 28, ry: 68, type: 'digital' },
      { id: 'NEG', label: '-', rx: 62, ry: 68, type: 'ground' },
    ],
  },
  {
    id: 'relay',
    name: '5V Relay Switch Module',
    nameHi: '5V रिले स्विच मॉड्यूल',
    category: 'actuator',
    voltage: '5V Control · High-Load Switch',
    width: 118,
    height: 78,
    summary: 'Electromagnetic switch allowing tiny 5V robot signals to safely turn pumps, lamps, or fans ON/OFF.',
    summaryHi: 'छोटे सिग्नल से बड़े पंप, बल्ब या पंखे को सुरक्षित रूप से चालू/बंद करने वाला स्विच।',
    safetyTip: 'Kids should practice relays only with low-voltage DC lamps and pumps.',
    realWorldUse: 'Automatic water pumps, smart home room lighting.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 24, ry: 70, type: 'power' },
      { id: 'IN', label: 'IN', rx: 59, ry: 70, type: 'digital' },
      { id: 'GND', label: 'GND', rx: 94, ry: 70, type: 'ground' },
    ],
  },
  {
    id: 'led_bulb',
    name: 'LED Light Diode',
    nameHi: 'LED लाइट बल्ब',
    category: 'display',
    voltage: '2V–3.3V (Use 220Ω Resistor)',
    width: 74,
    height: 76,
    summary: 'Light Emitting Diode that glows brightly when current flows from Anode (+) to Cathode (-).',
    summaryHi: 'चमकने वाला छोटा बल्ब, जो सही दिशा में करंट आने पर रोशनी देता है।',
    safetyTip: 'Always connect a 220Ω resistor in series with 5V Arduino pins so the LED does not burn out.',
    realWorldUse: 'Traffic signals, robot status indicators, wearable light art.',
    pins: [
      { id: 'ANODE', label: '+', rx: 24, ry: 68, type: 'digital' },
      { id: 'CATHODE', label: '-', rx: 50, ry: 68, type: 'ground' },
    ],
  },
  {
    id: 'lcd_16x2',
    name: '16x2 I2C LCD Display',
    nameHi: '16x2 LCD स्क्रीन',
    category: 'display',
    voltage: '5V · 2 Rows x 16 Characters',
    width: 168,
    height: 86,
    summary: 'Backlit character screen showing live sensor numbers, robot status, and custom kid messages.',
    summaryHi: 'दो लाइनों वाली स्क्रीन जो तापमान, दूरी और बच्चों के बनाए संदेश दिखाती है।',
    safetyTip: 'Adjust the small blue contrast knob on the back if characters look faint.',
    realWorldUse: 'Digital thermometers, vending machines, robot dashboards.',
    pins: [
      { id: 'VCC', label: 'VCC', rx: 24, ry: 78, type: 'power' },
      { id: 'GND', label: 'GND', rx: 64, ry: 78, type: 'ground' },
      { id: 'SDA', label: 'SDA', rx: 104, ry: 78, type: 'i2c' },
      { id: 'SCL', label: 'SCL', rx: 144, ry: 78, type: 'i2c' },
    ],
  },
  {
    id: 'seven_seg',
    name: '7-Segment Numeric Display',
    nameHi: '7-सेगमेंट नंबर डिस्प्ले',
    category: 'display',
    voltage: '5V · Digits 0–9',
    width: 84,
    height: 82,
    summary: 'Seven individual LED bars arranged in a figure-8 to display clear glowing digits 0–9.',
    summaryHi: '0 से 9 तक चमकते अंक दिखाने वाला डिजिटल डिस्प्ले।',
    safetyTip: 'Each LED bar needs current limiting resistors.',
    realWorldUse: 'Digital clocks, scoreboards, elevator floor displays.',
    pins: [
      { id: 'DIN', label: 'DATA', rx: 26, ry: 74, type: 'digital' },
      { id: 'GND', label: 'GND', rx: 58, ry: 74, type: 'ground' },
    ],
  },
  {
    id: 'battery_9v',
    name: '9V Battery & Breadboard Power',
    nameHi: '9V बैटरी पावर पैक',
    category: 'power',
    voltage: '9V DC Portable Supply',
    width: 100,
    height: 76,
    summary: 'Portable energy source allowing robots to drive freely without a USB cable.',
    summaryHi: 'रोबोट को बिना तार के कहीं भी चलाने के लिए 9 वोल्ट बैटरी पावर।',
    safetyTip: 'Never touch the positive and negative battery terminals together (short circuit).',
    realWorldUse: 'Autonomous rover chassis power, portable science fair projects.',
    pins: [
      { id: 'POS', label: '+9V', rx: 32, ry: 68, type: 'power' },
      { id: 'NEG', label: 'GND', rx: 68, ry: 68, type: 'ground' },
    ],
  },
];

export const ROBOTICS_PRACTICALS: RoboticsPractical[] = [
  {
    id: 'traffic_signal',
    title: '01. Smart Traffic Light Signal',
    titleHi: '01. स्मार्ट ट्रैफ़िक लाइट सिग्नल',
    level: 'Beginner',
    duration: '10 min',
    focusComponentId: 'led_bulb',
    description: 'Control Red, Yellow, and Green LEDs in timed road-safety cycles using Arduino digital pins.',
    descriptionHi: 'आर्डुइनो की डिजिटल पिन से लाल, पीली और हरी LED को ट्रैफ़िक सिग्नल की तरह क्रम से जलाएँ।',
    steps: [
      'Red LED connects to Pin D13, Yellow to D12, and Green to D9.',
      'All LED cathode (-) pins connect to Arduino GND.',
      'Press Run Practical to observe the automatic Green → Yellow → Red cycle.',
    ],
    stepsHi: [
      'लाल LED को पिन D13, पीली को D12 और हरी को D9 से जोड़ें।',
      'सभी LED के माइनस (-) पिन को GND से जोड़ें।',
      'प्रैक्टिकल चलाएँ दबाकर हरा → पीला → लाल सिग्नल चक्र देखें।',
    ],
    requiredSensors: [],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'led_r', defId: 'led_bulb', x: 390, y: 36, label: 'Red', colorVariant: 'red' },
      { instanceId: 'led_y', defId: 'led_bulb', x: 555, y: 165, label: 'Yellow', colorVariant: 'amber' },
      { instanceId: 'led_g', defId: 'led_bulb', x: 720, y: 295, label: 'Green', colorVariant: 'emerald' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'led_r', toPinId: 'ANODE', color: '#DC2626' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D12', toInstanceId: 'led_y', toPinId: 'ANODE', color: '#D97706' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D9', toInstanceId: 'led_g', toPinId: 'ANODE', color: '#059669' },
      { id: 'w4', fromInstanceId: 'led_r', fromPinId: 'CATHODE', toInstanceId: 'mcu', toPinId: 'GND', color: '#334155' },
    ],
    simulate: (_env, tick) => {
      const phase = tick % 6;
      const isGreen = phase < 2;
      const isYellow = phase === 2;
      const isRed = phase >= 3;
      return {
        ledStates: { led_r: isRed, led_y: isYellow, led_g: isGreen },
        ledBrightness: { led_r: isRed ? 100 : 0, led_y: isYellow ? 100 : 0, led_g: isGreen ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: String((phase % 3) + 1),
        pinStates: [
          { pin: 'D13 (Red)', state: isRed ? 'HIGH' : 'LOW', voltage: isRed ? '5.0V' : '0.0V', active: isRed },
          { pin: 'D12 (Yellow)', state: isYellow ? 'HIGH' : 'LOW', voltage: isYellow ? '5.0V' : '0.0V', active: isYellow },
          { pin: 'D9 (Green)', state: isGreen ? 'HIGH' : 'LOW', voltage: isGreen ? '5.0V' : '0.0V', active: isGreen },
        ],
        serialLogs: [
          `Traffic Phase: ${isGreen ? 'GO (GREEN)' : isYellow ? 'WAIT (YELLOW)' : 'STOP (RED)'}`,
        ],
      };
    },
    arduinoCode: `void setup() {
  pinMode(13, OUTPUT); // Red
  pinMode(12, OUTPUT); // Yellow
  pinMode(9, OUTPUT);  // Green
}
void loop() {
  digitalWrite(9, HIGH); delay(2000); digitalWrite(9, LOW);
  digitalWrite(12, HIGH); delay(1000); digitalWrite(12, LOW);
  digitalWrite(13, HIGH); delay(3000); digitalWrite(13, LOW);
}`,
  },
  {
    id: 'ultrasonic_radar',
    title: '02. Ultrasonic Parking & Distance Radar',
    titleHi: '02. अल्ट्रासोनिक दूरी और पार्किंग रडार',
    level: 'Beginner',
    duration: '15 min',
    focusComponentId: 'ultrasonic',
    description: 'Use sound waves to measure obstacle distance, show centimeters on LCD, and trigger a buzzer below 30 cm.',
    descriptionHi: 'सोनार तरंगों से दूरी मापें, LCD पर सेंटीमीटर दिखाएँ और 30 सेमी से कम दूरी पर अलार्म बजाएँ।',
    steps: [
      'Adjust the Obstacle Distance slider to simulate an object moving closer.',
      'When distance drops below 30 cm, the Red LED glows and the Buzzer beeps.',
      'Read exact centimeter measurements live on the 16x2 LCD screen.',
    ],
    stepsHi: [
      'बाधा की दूरी स्लाइडर को खिसकाकर वस्तु को पास या दूर करें।',
      '30 सेमी से कम दूरी होने पर लाल LED जलेगी और बज़र अलार्म बजेगा।',
      '16x2 LCD स्क्रीन पर सटीक दूरी सेंटीमीटर में पढ़ें।',
    ],
    requiredSensors: ['distanceCm'],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'sonar', defId: 'ultrasonic', x: 370, y: 35 },
      { instanceId: 'lcd', defId: 'lcd_16x2', x: 365, y: 295 },
      { instanceId: 'buz', defId: 'buzzer', x: 680, y: 45 },
      { instanceId: 'led_alert', defId: 'led_bulb', x: 690, y: 280, label: 'Alert', colorVariant: 'red' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'mcu', fromPinId: '5V', toInstanceId: 'sonar', toPinId: 'VCC', color: '#DC2626' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D9', toInstanceId: 'sonar', toPinId: 'TRIG', color: '#0284C7' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D12', toInstanceId: 'sonar', toPinId: 'ECHO', color: '#7C3AED' },
      { id: 'w4', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'buz', toPinId: 'POS', color: '#D97706' },
      { id: 'w5', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'led_alert', toPinId: 'ANODE', color: '#DC2626' },
    ],
    simulate: (env, tick) => {
      const danger = env.distanceCm < 30;
      const beepOn = danger && tick % 2 === 0;
      return {
        ledStates: { led_alert: danger },
        ledBrightness: { led_alert: danger ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: beepOn ? 880 : 0,
        relayClosed: false,
        lcdLine1: `DIST: ${String(env.distanceCm).padStart(3, ' ')} cm`,
        lcdLine2: danger ? 'ALERT: TOO CLOSE' : 'STATUS: CLEAR',
        sevenSegChar: String(Math.min(9, Math.floor(env.distanceCm / 20))),
        pinStates: [
          { pin: 'D9 (Trig)', state: 'PULSE', voltage: '5.0V', active: true },
          { pin: 'D12 (Echo)', state: `${env.distanceCm} cm`, voltage: '3.4V', active: true },
          { pin: 'D13 (Alarm)', state: danger ? 'HIGH' : 'LOW', voltage: danger ? '5.0V' : '0.0V', active: danger },
        ],
        serialLogs: [`HC-SR04 Distance = ${env.distanceCm} cm | Alarm = ${danger ? 'ON' : 'OFF'}`],
      };
    },
    arduinoCode: `const int trigPin = 9, echoPin = 12, buzzer = 13;
void loop() {
  long dist = readUltrasonic(trigPin, echoPin);
  Serial.println("Distance: " + String(dist) + " cm");
  digitalWrite(buzzer, dist < 30 ? HIGH : LOW);
}`,
  },
  {
    id: 'auto_streetlight',
    title: '03. Automatic Night Street Light',
    titleHi: '03. ऑटोमैटिक रात की स्ट्रीट लाइट',
    level: 'Beginner',
    duration: '10 min',
    focusComponentId: 'ldr_sensor',
    description: 'Build an energy-saving street lamp that switches ON automatically when sunlight drops below 35%.',
    descriptionHi: 'बिजली बचाने वाली स्ट्रीट लाइट बनाएँ जो अंधेरा (35% से कम रोशनी) होने पर खुद जल जाए।',
    steps: [
      'Lower the Ambient Light slider below 35% to simulate sunset.',
      'Arduino reads analog pin A0 and triggers the Relay and Street Lamp LED.',
      'Raise light above 35% to see the lamp switch OFF automatically.',
    ],
    stepsHi: [
      'सूरज ढलने का अनुभव करने के लिए रोशनी स्लाइडर को 35% से नीचे लाएँ।',
      'आर्डुइनो पिन A0 से पढ़कर रिले और स्ट्रीट लाइट को चालू कर देता है।',
      'रोशनी बढ़ाने पर लाइट अपने आप बंद हो जाएगी।',
    ],
    requiredSensors: ['lightPercent'],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'ldr', defId: 'ldr_sensor', x: 375, y: 45 },
      { instanceId: 'rel', defId: 'relay', x: 375, y: 285 },
      { instanceId: 'lamp', defId: 'led_bulb', x: 685, y: 170, label: 'Lamp', colorVariant: 'amber' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'ldr', fromPinId: 'AO', toInstanceId: 'mcu', toPinId: 'A0', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'rel', toPinId: 'IN', color: '#059669' },
      { id: 'w3', fromInstanceId: 'rel', fromPinId: 'IN', toInstanceId: 'lamp', toPinId: 'ANODE', color: '#D97706' },
    ],
    simulate: (env) => {
      const dark = env.lightPercent < 35;
      const volts = ((env.lightPercent / 100) * 5).toFixed(2);
      return {
        ledStates: { lamp: dark },
        ledBrightness: { lamp: dark ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: 0,
        relayClosed: dark,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: dark ? '1' : '0',
        pinStates: [
          { pin: 'A0 (LDR)', state: `${env.lightPercent}%`, voltage: `${volts}V`, active: true },
          { pin: 'D13 (Relay)', state: dark ? 'HIGH' : 'LOW', voltage: dark ? '5.0V' : '0.0V', active: dark },
        ],
        serialLogs: [`Ambient Light: ${env.lightPercent}% -> Street Lamp ${dark ? 'ON (Night)' : 'OFF (Day)'}`],
      };
    },
    arduinoCode: `void loop() {
  int light = analogRead(A0);
  if (light < 350) digitalWrite(13, HIGH); // Night: Lamp ON
  else digitalWrite(13, LOW);              // Day: Lamp OFF
}`,
  },
  {
    id: 'servo_gate',
    title: '04. Smart Servo Toll Gate',
    titleHi: '04. स्मार्ट सर्वो टोल गेट',
    level: 'Beginner',
    duration: '12 min',
    focusComponentId: 'servo_motor',
    description: 'Rotate a servo gate barrier smoothly to 90° when the entry push button is pressed.',
    descriptionHi: 'बटन दबाने पर सर्वो मोटर की मदद से टोल गेट को 90 डिग्री ऊपर खोलें।',
    steps: [
      'Hold or toggle the Push Button control in the sensor panel.',
      'Observe the SG90 Servo Motor arm swing smoothly from 0° (Closed) to 90° (Open).',
      'Green LED lights up to signal safe passage.',
    ],
    stepsHi: [
      'सेंसर पैनल में पुश बटन को दबाएँ।',
      'देखें कि सर्वो मोटर का आर्म 0° (बंद) से 90° (खुला) तक घूमता है।',
      'रास्ता साफ होने पर हरी LED जलती है।',
    ],
    requiredSensors: ['buttonPressed'],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'btn', defId: 'push_button', x: 380, y: 45 },
      { instanceId: 'srv', defId: 'servo_motor', x: 660, y: 50 },
      { instanceId: 'led_go', defId: 'led_bulb', x: 440, y: 290, label: 'Pass', colorVariant: 'emerald' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'btn', fromPinId: 'IN', toInstanceId: 'mcu', toPinId: 'D2', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D9', toInstanceId: 'srv', toPinId: 'SIG', color: '#D97706' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'led_go', toPinId: 'ANODE', color: '#059669' },
    ],
    simulate: (env) => {
      const open = env.buttonPressed;
      return {
        ledStates: { led_go: open },
        ledBrightness: { led_go: open ? 100 : 0 },
        servoAngle: open ? 90 : 0,
        motorRpm: 0,
        buzzerFreq: 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: open ? '9' : '0',
        pinStates: [
          { pin: 'D2 (Button)', state: open ? 'PRESSED' : 'OPEN', voltage: open ? '5.0V' : '0.0V', active: open },
          { pin: 'D9 (Servo PWM)', state: open ? '90 deg' : '0 deg', voltage: 'PWM', active: open },
          { pin: 'D13 (LED)', state: open ? 'HIGH' : 'LOW', voltage: open ? '5.0V' : '0.0V', active: open },
        ],
        serialLogs: [`Gate Servo Angle: ${open ? '90° OPEN' : '0° CLOSED'}`],
      };
    },
    arduinoCode: `#include <Servo.h>
Servo gate;
void setup() { gate.attach(9); pinMode(2, INPUT); }
void loop() {
  gate.write(digitalRead(2) == HIGH ? 90 : 0);
}`,
  },
  {
    id: 'weather_alert',
    title: '05. ESP32 Weather & Heat Station',
    titleHi: '05. ESP32 मौसम और गर्मी अलर्ट स्टेशन',
    level: 'Intermediate',
    duration: '15 min',
    focusComponentId: 'dht11',
    description: 'Read live temperature & humidity with DHT11 on ESP32, display it on I2C LCD, and sound a heat warning above 35°C.',
    descriptionHi: 'ESP32 और DHT11 से तापमान व नमी मापें, LCD पर दिखाएँ और 35°C से अधिक होने पर अलर्ट बजाएँ।',
    steps: [
      'Drag the Temperature slider above 35°C to trigger the heat wave alarm.',
      'Watch the 16x2 LCD update live with Celsius and Humidity %.',
      'Red LED and Buzzer alert when temperature exceeds threshold.',
    ],
    stepsHi: [
      'गर्मी अलार्म देखने के लिए तापमान स्लाइडर को 35°C से ऊपर ले जाएँ।',
      '16x2 LCD स्क्रीन पर तापमान और नमी की प्रतिशत मात्रा देखें।',
      'अधिक तापमान पर लाल LED और बज़र चेतावनी देते हैं।',
    ],
    requiredSensors: ['temperatureC', 'humidityPercent'],
    components: [
      { instanceId: 'esp', defId: 'esp32', x: 40, y: 165 },
      { instanceId: 'dht', defId: 'dht11', x: 370, y: 40 },
      { instanceId: 'lcd', defId: 'lcd_16x2', x: 360, y: 290 },
      { instanceId: 'led_hot', defId: 'led_bulb', x: 690, y: 55, label: 'Heat', colorVariant: 'red' },
      { instanceId: 'buz', defId: 'buzzer', x: 685, y: 285 },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'dht', fromPinId: 'DATA', toInstanceId: 'esp', toPinId: 'GPIO4', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'esp', fromPinId: 'GPIO21', toInstanceId: 'lcd', toPinId: 'SDA', color: '#059669' },
      { id: 'w3', fromInstanceId: 'esp', fromPinId: 'GPIO22', toInstanceId: 'lcd', toPinId: 'SCL', color: '#7C3AED' },
      { id: 'w4', fromInstanceId: 'esp', fromPinId: 'GPIO18', toInstanceId: 'led_hot', toPinId: 'ANODE', color: '#DC2626' },
    ],
    simulate: (env, tick) => {
      const hot = env.temperatureC >= 35;
      return {
        ledStates: { led_hot: hot },
        ledBrightness: { led_hot: hot ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: hot && tick % 2 === 0 ? 660 : 0,
        relayClosed: false,
        lcdLine1: `TEMP: ${env.temperatureC} C  HUM:${env.humidityPercent}%`,
        lcdLine2: hot ? 'WARN: HIGH HEAT!' : 'CLIMATE: NORMAL',
        sevenSegChar: String(Math.floor(env.temperatureC / 10)),
        pinStates: [
          { pin: 'IO4 (DHT11)', state: `${env.temperatureC}°C`, voltage: '3.3V', active: true },
          { pin: 'I2C (LCD)', state: 'STREAMING', voltage: '3.3V', active: true },
          { pin: 'IO18 (Alert)', state: hot ? 'HIGH' : 'LOW', voltage: hot ? '3.3V' : '0.0V', active: hot },
        ],
        serialLogs: [`ESP32 WiFi Telemetry -> ${env.temperatureC}°C, ${env.humidityPercent}% RH`],
      };
    },
    arduinoCode: `#include <DHT.h>
void loop() {
  float t = dht.readTemperature();
  lcd.print("TEMP: " + String(t) + " C");
  digitalWrite(18, t >= 35 ? HIGH : LOW);
}`,
  },
  {
    id: 'rover_drive',
    title: '06. Obstacle Avoiding Robot Drive',
    titleHi: '06. बाधा से बचने वाली रोबोट मोटर ड्राइव',
    level: 'Intermediate',
    duration: '15 min',
    focusComponentId: 'dc_motor',
    description: 'Drive twin DC rover motors forward when the path is clear and brake/reverse when an obstacle is under 25 cm.',
    descriptionHi: 'रास्ता साफ होने पर रोबोट मोटर को आगे चलाएँ और 25 सेमी में दीवार आने पर रोक दें।',
    steps: [
      'Adjust Distance slider above 25 cm to spin the DC Rover Motor at full speed.',
      'Move an obstacle closer than 25 cm to see the motor brake and Status LED warn.',
      'Powered by portable 9V battery pack.',
    ],
    stepsHi: [
      'रोबोट की मोटर चलाने के लिए दूरी को 25 सेमी से ऊपर रखें।',
      '25 सेमी से कम दूरी आने पर मोटर तुरंत रुक जाएगी और लाल बत्ती जलेगी।',
      'पोर्टेबल 9V बैटरी से रोबोट को ऊर्जा मिलती है।',
    ],
    requiredSensors: ['distanceCm'],
    components: [
      { instanceId: 'bat', defId: 'battery_9v', x: 45, y: 35 },
      { instanceId: 'mcu', defId: 'arduino_uno', x: 45, y: 245 },
      { instanceId: 'sonar', defId: 'ultrasonic', x: 375, y: 40 },
      { instanceId: 'mot1', defId: 'dc_motor', x: 385, y: 270 },
      { instanceId: 'led_brk', defId: 'led_bulb', x: 695, y: 160, label: 'Brake', colorVariant: 'red' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'bat', fromPinId: 'POS', toInstanceId: 'mcu', toPinId: '5V', color: '#DC2626' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D5', toInstanceId: 'mot1', toPinId: 'POS', color: '#0284C7' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D9', toInstanceId: 'sonar', toPinId: 'TRIG', color: '#059669' },
      { id: 'w4', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'led_brk', toPinId: 'ANODE', color: '#DC2626' },
    ],
    simulate: (env) => {
      const blocked = env.distanceCm < 25;
      const rpm = blocked ? 0 : Math.min(220, Math.round((env.distanceCm / 150) * 220));
      return {
        ledStates: { led_brk: blocked },
        ledBrightness: { led_brk: blocked ? 100 : 0 },
        servoAngle: 0,
        motorRpm: rpm,
        buzzerFreq: 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: blocked ? '0' : '8',
        pinStates: [
          { pin: 'D5 (Motor PWM)', state: `${rpm} RPM`, voltage: blocked ? '0.0V' : '4.6V', active: !blocked },
          { pin: 'D9 (Sonar)', state: `${env.distanceCm} cm`, voltage: '5.0V', active: true },
          { pin: 'D13 (Brake)', state: blocked ? 'BRAKE' : 'CLEAR', voltage: blocked ? '5.0V' : '0.0V', active: blocked },
        ],
        serialLogs: [`Rover Speed: ${rpm} RPM | Path: ${blocked ? 'OBSTACLE DETECTED' : 'CLEAR'}`],
      };
    },
    arduinoCode: `void loop() {
  int d = getDistance();
  if (d < 25) analogWrite(5, 0);   // Brake
  else analogWrite(5, 220);        // Drive Forward
}`,
  },
  {
    id: 'ir_doorbell',
    title: '07. Touchless IR Doorbell (micro:bit)',
    titleHi: '07. बिना छुए बजने वाली IR डोरबेल',
    level: 'Beginner',
    duration: '10 min',
    focusComponentId: 'ir_sensor',
    description: 'Wave a hand in front of the Infrared sensor to ring the Piezo Buzzer without touching any switch.',
    descriptionHi: 'IR सेंसर के सामने हाथ ले जाकर बिना बटन छुए डोरबेल बजाएँ।',
    steps: [
      'Toggle IR Hand Detected ON in the environment panel.',
      'micro:bit triggers a friendly chime on the buzzer and lights the Sky LED.',
    ],
    stepsHi: [
      'सेंसर पैनल में IR सेंसर डिटेक्शन को चालू करें।',
      'माइक्रो:बिट बज़र पर मधुर घंटी बजाता है और नीली LED जलती है।',
    ],
    requiredSensors: ['irDetected'],
    components: [
      { instanceId: 'mb', defId: 'microbit', x: 45, y: 165 },
      { instanceId: 'ir', defId: 'ir_sensor', x: 375, y: 50 },
      { instanceId: 'buz', defId: 'buzzer', x: 390, y: 285 },
      { instanceId: 'led_b', defId: 'led_bulb', x: 685, y: 165, label: 'Bell', colorVariant: 'sky' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'ir', fromPinId: 'OUT', toInstanceId: 'mb', toPinId: 'P0', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'mb', fromPinId: 'P1', toInstanceId: 'buz', toPinId: 'POS', color: '#D97706' },
      { id: 'w3', fromInstanceId: 'mb', fromPinId: 'P2', toInstanceId: 'led_b', toPinId: 'ANODE', color: '#059669' },
    ],
    simulate: (env, tick) => {
      const ring = env.irDetected;
      return {
        ledStates: { led_b: ring },
        ledBrightness: { led_b: ring ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: ring ? (tick % 2 === 0 ? 523 : 659) : 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: ring ? '1' : '0',
        pinStates: [
          { pin: 'P0 (IR In)', state: ring ? 'DETECTED' : 'CLEAR', voltage: ring ? '3.3V' : '0.0V', active: ring },
          { pin: 'P1 (Buzzer)', state: ring ? 'RINGING' : 'SILENT', voltage: ring ? '3.3V' : '0.0V', active: ring },
        ],
        serialLogs: [`Touchless IR: ${ring ? 'Hand Wave Detected -> Ringing Bell!' : 'Waiting for guest'}`],
      };
    },
    arduinoCode: `// micro:bit Touchless Doorbell
if (pins.digitalReadPin(DigitalPin.P0) == 1) {
  music.playTone(523, 250);
}`,
  },
  {
    id: 'smart_plant',
    title: '08. Smart Plant Irrigation Pump',
    titleHi: '08. स्मार्ट पौधा सिंचाई सिस्टम',
    level: 'Intermediate',
    duration: '15 min',
    focusComponentId: 'soil_sensor',
    description: 'Automatically switch on a water relay when soil moisture falls below 35% and display status on LCD.',
    descriptionHi: 'मिट्टी की नमी 35% से कम होने पर रिले से पानी का पंप खुद चालू करें और LCD पर दिखाएँ।',
    steps: [
      'Lower Soil Moisture below 35% to simulate dry soil.',
      'Relay clicks CLOSED, turning on the Green Pump LED and updating the LCD.',
    ],
    stepsHi: [
      'सूखी मिट्टी दिखाने के लिए नमी स्लाइडर को 35% से कम करें।',
      'रिले चालू होगा और LCD पर पंप ON दिखाई देगा।',
    ],
    requiredSensors: ['moisturePercent'],
    components: [
      { instanceId: 'esp', defId: 'esp32', x: 40, y: 165 },
      { instanceId: 'soil', defId: 'soil_sensor', x: 365, y: 40 },
      { instanceId: 'rel', defId: 'relay', x: 655, y: 45 },
      { instanceId: 'lcd', defId: 'lcd_16x2', x: 360, y: 290 },
      { instanceId: 'pump', defId: 'led_bulb', x: 685, y: 285, label: 'Pump', colorVariant: 'emerald' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'soil', fromPinId: 'AO', toInstanceId: 'esp', toPinId: 'GPIO4', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'esp', fromPinId: 'GPIO18', toInstanceId: 'rel', toPinId: 'IN', color: '#059669' },
      { id: 'w3', fromInstanceId: 'rel', fromPinId: 'IN', toInstanceId: 'pump', toPinId: 'ANODE', color: '#059669' },
      { id: 'w4', fromInstanceId: 'esp', fromPinId: 'GPIO21', toInstanceId: 'lcd', toPinId: 'SDA', color: '#7C3AED' },
    ],
    simulate: (env) => {
      const dry = env.moisturePercent < 35;
      return {
        ledStates: { pump: dry },
        ledBrightness: { pump: dry ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: 0,
        relayClosed: dry,
        lcdLine1: `SOIL MOIST: ${env.moisturePercent}%`,
        lcdLine2: dry ? 'PUMP: WATERING' : 'SOIL: HEALTHY',
        sevenSegChar: String(Math.floor(env.moisturePercent / 10)),
        pinStates: [
          { pin: 'IO4 (Soil)', state: `${env.moisturePercent}%`, voltage: '2.1V', active: true },
          { pin: 'IO18 (Pump Relay)', state: dry ? 'ON' : 'OFF', voltage: dry ? '3.3V' : '0.0V', active: dry },
        ],
        serialLogs: [`Soil Moisture: ${env.moisturePercent}% -> Water Pump ${dry ? 'ACTIVE' : 'STANDBY'}`],
      };
    },
    arduinoCode: `void loop() {
  int moisture = map(analogRead(4), 0, 4095, 100, 0);
  digitalWrite(18, moisture < 35 ? HIGH : LOW);
}`,
  },
  {
    id: 'pwm_dimmer',
    title: '09. PWM Motor Speed & Light Dimmer',
    titleHi: '09. PWM मोटर स्पीड और लाइट डिमर',
    level: 'Intermediate',
    duration: '12 min',
    focusComponentId: 'potentiometer',
    description: 'Turn a rotary potentiometer knob to smoothly vary PWM duty cycle for motor RPM and LED brightness.',
    descriptionHi: 'नॉब घुमाकर मोटर की रफ़्तार और LED की चमक को 0% से 100% तक नियंत्रित करें।',
    steps: [
      'Move the Potentiometer Knob slider from 0% to 100%.',
      'Watch DC Motor RPM and LED glow scale smoothly in real time.',
    ],
    stepsHi: [
      'नॉब स्लाइडर को 0% से 100% तक घुमाएँ।',
      'DC मोटर की गति और LED की चमक को धीरे-धीरे बढ़ते हुए देखें।',
    ],
    requiredSensors: ['potentiometerPercent'],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'pot', defId: 'potentiometer', x: 375, y: 45 },
      { instanceId: 'mot', defId: 'dc_motor', x: 650, y: 45 },
      { instanceId: 'led_pwm', defId: 'led_bulb', x: 400, y: 290, label: 'PWM', colorVariant: 'sky' },
      { instanceId: 'seg', defId: 'seven_seg', x: 675, y: 280 },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'pot', fromPinId: 'SIG', toInstanceId: 'mcu', toPinId: 'A0', color: '#D97706' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D5', toInstanceId: 'mot', toPinId: 'POS', color: '#0284C7' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D9', toInstanceId: 'led_pwm', toPinId: 'ANODE', color: '#0284C7' },
    ],
    simulate: (env) => {
      const pct = env.potentiometerPercent;
      const rpm = Math.round((pct / 100) * 240);
      const digit = String(Math.min(9, Math.floor(pct / 10)));
      return {
        ledStates: { led_pwm: pct > 5 },
        ledBrightness: { led_pwm: pct },
        servoAngle: Math.round((pct / 100) * 180),
        motorRpm: rpm,
        buzzerFreq: 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: digit,
        pinStates: [
          { pin: 'A0 (Knob)', state: `${pct}%`, voltage: `${((pct / 100) * 5).toFixed(2)}V`, active: pct > 0 },
          { pin: 'D5 (PWM Out)', state: `${Math.round((pct / 100) * 255)}/255`, voltage: 'PWM', active: pct > 0 },
        ],
        serialLogs: [`PWM Duty: ${pct}% -> Motor ${rpm} RPM | 7-Seg: ${digit}`],
      };
    },
    arduinoCode: `void loop() {
  int val = analogRead(A0);
  int pwm = map(val, 0, 1023, 0, 255);
  analogWrite(5, pwm);
  analogWrite(9, pwm);
}`,
  },
  {
    id: 'morse_sos',
    title: '10. Morse Code SOS Transmitter',
    titleHi: '10. मोर्स कोड SOS सिग्नल ट्रांसमीटर',
    level: 'Advanced',
    duration: '15 min',
    focusComponentId: 'buzzer',
    description: 'Send international emergency Morse code (... --- ...) using synchronized LED flashes and Buzzer beeps.',
    descriptionHi: 'LED की चमक और बज़र की आवाज़ से अंतर्राष्ट्रीय मोर्स कोड (... --- ...) सिग्नल भेजें।',
    steps: [
      'Press Run Practical to transmit the automated S-O-S pattern or press the manual button.',
      'Observe short dots and long dashes on Pin D13.',
    ],
    stepsHi: [
      'SOS सिग्नल भेजने के लिए प्रैक्टिकल चलाएँ या बटन दबाएँ।',
      'पिन D13 पर छोटे और लंबे बीप पैटर्न को देखें।',
    ],
    requiredSensors: ['buttonPressed'],
    components: [
      { instanceId: 'mcu', defId: 'arduino_uno', x: 40, y: 165 },
      { instanceId: 'btn', defId: 'push_button', x: 385, y: 45 },
      { instanceId: 'buz', defId: 'buzzer', x: 675, y: 50 },
      { instanceId: 'led_sos', defId: 'led_bulb', x: 445, y: 290, label: 'SOS', colorVariant: 'red' },
    ],
    wires: [
      { id: 'w1', fromInstanceId: 'btn', fromPinId: 'IN', toInstanceId: 'mcu', toPinId: 'D2', color: '#0284C7' },
      { id: 'w2', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'buz', toPinId: 'POS', color: '#DC2626' },
      { id: 'w3', fromInstanceId: 'mcu', fromPinId: 'D13', toInstanceId: 'led_sos', toPinId: 'ANODE', color: '#DC2626' },
    ],
    simulate: (env, tick) => {
      const pattern = [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0];
      const active = env.buttonPressed || pattern[tick % pattern.length] === 1;
      return {
        ledStates: { led_sos: active },
        ledBrightness: { led_sos: active ? 100 : 0 },
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: active ? 784 : 0,
        relayClosed: false,
        lcdLine1: '',
        lcdLine2: '',
        sevenSegChar: active ? '5' : '0',
        pinStates: [
          { pin: 'D13 (Morse)', state: active ? 'SIGNAL ON' : 'GAP', voltage: active ? '5.0V' : '0.0V', active },
        ],
        serialLogs: [`Morse Stream: ${active ? 'BEEP / FLASH' : '...'}`],
      };
    },
    arduinoCode: `// SOS Pattern: 3 short, 3 long, 3 short
void flash(int ms) {
  digitalWrite(13, HIGH); tone(13, 784); delay(ms);
  digitalWrite(13, LOW); noTone(13); delay(150);
}`,
  },
];

export function getComponentDef(defId: string): RoboticsComponentDef | undefined {
  return ROBOTICS_COMPONENTS.find((c) => c.id === defId);
}
