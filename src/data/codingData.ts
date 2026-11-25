export type BlockType =
  | 'led_on'
  | 'led_off'
  | 'servo_angle'
  | 'motor_speed'
  | 'buzzer_beep'
  | 'lcd_show'
  | 'rover_forward'
  | 'rover_left'
  | 'rover_right'
  | 'wait_sec'
  | 'repeat_start'
  | 'repeat_end'
  | 'if_obstacle'
  | 'print_msg';

export interface CodeBlock {
  uid: string;
  type: BlockType;
  param?: string | number;
}

export interface BlockTemplate {
  type: BlockType;
  label: string;
  labelHi: string;
  category: 'hardware' | 'rover' | 'control' | 'output';
  defaultParam?: string | number;
  paramLabel?: string;
  colorClass: string;
}

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  { type: 'led_on', label: 'Turn LED ON (Pin 13)', labelHi: 'LED चालू करें (Pin 13)', category: 'hardware', colorClass: 'border border-emerald-400/70 bg-emerald-500/20 text-emerald-950 backdrop-blur-md hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.22)]' },
  { type: 'led_off', label: 'Turn LED OFF (Pin 13)', labelHi: 'LED बंद करें (Pin 13)', category: 'hardware', colorClass: 'border border-slate-400/70 bg-slate-500/15 text-slate-900 backdrop-blur-md hover:bg-slate-500/30 hover:border-slate-500 hover:shadow-[0_6px_18px_rgba(15,23,42,0.14)]' },
  { type: 'servo_angle', label: 'Rotate Servo to (°)', labelHi: 'सर्वो घुमाएँ (°)', category: 'hardware', defaultParam: 90, paramLabel: 'deg', colorClass: 'border border-amber-400/70 bg-amber-500/20 text-amber-950 backdrop-blur-md hover:bg-amber-500/35 hover:border-amber-500 hover:shadow-[0_6px_18px_rgba(217,119,6,0.22)]' },
  { type: 'motor_speed', label: 'Set Motor Speed (%)', labelHi: 'मोटर स्पीड (%)', category: 'hardware', defaultParam: 80, paramLabel: '%', colorClass: 'border border-sky-400/70 bg-sky-500/20 text-sky-950 backdrop-blur-md hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)]' },
  { type: 'buzzer_beep', label: 'Play Buzzer Tone (Hz)', labelHi: 'बज़र बजाएँ (Hz)', category: 'hardware', defaultParam: 660, paramLabel: 'Hz', colorClass: 'border border-violet-400/70 bg-violet-500/20 text-violet-950 backdrop-blur-md hover:bg-violet-500/35 hover:border-violet-500 hover:shadow-[0_6px_18px_rgba(124,58,237,0.22)]' },
  { type: 'lcd_show', label: 'Show on LCD Screen', labelHi: 'LCD पर दिखाएँ', category: 'output', defaultParam: 'HELLO ROBOT!', colorClass: 'border border-teal-400/70 bg-teal-500/20 text-teal-950 backdrop-blur-md hover:bg-teal-500/35 hover:border-teal-500 hover:shadow-[0_6px_18px_rgba(13,148,136,0.22)]' },
  { type: 'rover_forward', label: 'Move Rover Forward', labelHi: 'रोवर आगे बढ़ाएँ', category: 'rover', defaultParam: 1, paramLabel: 'steps', colorClass: 'border border-sky-400/70 bg-sky-500/20 text-sky-950 backdrop-blur-md hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)]' },
  { type: 'rover_left', label: 'Turn Rover Left 90°', labelHi: 'रोवर बाएँ मोड़ें 90°', category: 'rover', colorClass: 'border border-indigo-400/70 bg-indigo-500/20 text-indigo-950 backdrop-blur-md hover:bg-indigo-500/35 hover:border-indigo-500 hover:shadow-[0_6px_18px_rgba(79,70,229,0.22)]' },
  { type: 'rover_right', label: 'Turn Rover Right 90°', labelHi: 'रोवर दाएँ मोड़ें 90°', category: 'rover', colorClass: 'border border-indigo-400/70 bg-indigo-500/20 text-indigo-950 backdrop-blur-md hover:bg-indigo-500/35 hover:border-indigo-500 hover:shadow-[0_6px_18px_rgba(79,70,229,0.22)]' },
  { type: 'if_obstacle', label: 'If Obstacle < 20cm Turn Right', labelHi: 'बाधा < 20cm हो तो दाएँ मुड़ें', category: 'control', colorClass: 'border border-rose-400/70 bg-rose-500/20 text-rose-950 backdrop-blur-md hover:bg-rose-500/35 hover:border-rose-500 hover:shadow-[0_6px_18px_rgba(225,29,72,0.22)]' },
  { type: 'wait_sec', label: 'Wait Seconds', labelHi: 'रुकें (सेकंड)', category: 'control', defaultParam: 1, paramLabel: 's', colorClass: 'border border-amber-400/70 bg-amber-500/20 text-amber-950 backdrop-blur-md hover:bg-amber-500/35 hover:border-amber-500 hover:shadow-[0_6px_18px_rgba(217,119,6,0.22)]' },
  { type: 'repeat_start', label: 'Repeat Times', labelHi: 'दोहराएँ (बार)', category: 'control', defaultParam: 3, paramLabel: 'x', colorClass: 'border border-orange-400/70 bg-orange-500/20 text-orange-950 backdrop-blur-md hover:bg-orange-500/35 hover:border-orange-500 hover:shadow-[0_6px_18px_rgba(234,88,12,0.22)]' },
  { type: 'repeat_end', label: 'End Repeat', labelHi: 'दोहराना समाप्त', category: 'control', colorClass: 'border border-orange-400/70 bg-orange-500/20 text-orange-950 backdrop-blur-md hover:bg-orange-500/35 hover:border-orange-500 hover:shadow-[0_6px_18px_rgba(234,88,12,0.22)]' },
  { type: 'print_msg', label: 'Print Message', labelHi: 'संदेश प्रिंट करें', category: 'output', defaultParam: 'Robot Ready!', colorClass: 'border border-cyan-400/70 bg-cyan-500/20 text-cyan-950 backdrop-blur-md hover:bg-cyan-500/35 hover:border-cyan-500 hover:shadow-[0_6px_18px_rgba(8,145,178,0.22)]' },
];

export const DEFAULT_BLOCKS: CodeBlock[] = [
  { uid: 'b1', type: 'print_msg', param: 'Starting Smart Rover!' },
  { uid: 'b2', type: 'led_on' },
  { uid: 'b3', type: 'repeat_start', param: 2 },
  { uid: 'b4', type: 'rover_forward', param: 2 },
  { uid: 'b5', type: 'rover_right' },
  { uid: 'b6', type: 'repeat_end' },
  { uid: 'b7', type: 'servo_angle', param: 90 },
  { uid: 'b8', type: 'buzzer_beep', param: 660 },
];

export function transpileBlocks(blocks: CodeBlock[], target: 'python' | 'javascript' | 'arduino'): string {
  const lines: string[] = [];
  let indent = 0;
  const pad = () => '  '.repeat(indent);

  if (target === 'python') {
    lines.push('import robot, time');
    lines.push('');
    for (const b of blocks) {
      if (b.type === 'repeat_end') {
        indent = Math.max(0, indent - 1);
        continue;
      }
      switch (b.type) {
        case 'led_on': lines.push(`${pad()}robot.led(13, True)`); break;
        case 'led_off': lines.push(`${pad()}robot.led(13, False)`); break;
        case 'servo_angle': lines.push(`${pad()}robot.servo(9, ${Number(b.param ?? 90)})`); break;
        case 'motor_speed': lines.push(`${pad()}robot.motor_speed(${Number(b.param ?? 80)})`); break;
        case 'buzzer_beep': lines.push(`${pad()}robot.beep(${Number(b.param ?? 660)})`); break;
        case 'lcd_show': lines.push(`${pad()}robot.lcd("${String(b.param ?? 'HI')}")`); break;
        case 'rover_forward': lines.push(`${pad()}robot.forward(${Number(b.param ?? 1)})`); break;
        case 'rover_left': lines.push(`${pad()}robot.turn_left()`); break;
        case 'rover_right': lines.push(`${pad()}robot.turn_right()`); break;
        case 'if_obstacle': lines.push(`${pad()}if robot.distance_cm() < 20: robot.turn_right()`); break;
        case 'wait_sec': lines.push(`${pad()}time.sleep(${Number(b.param ?? 1)})`); break;
        case 'print_msg': lines.push(`${pad()}print("${String(b.param ?? 'Hello')}")`); break;
        case 'repeat_start':
          lines.push(`${pad()}for step in range(${Number(b.param ?? 2)}):`);
          indent += 1;
          break;
      }
    }
    return lines.join('\n');
  }

  if (target === 'javascript') {
    lines.push('// Auto-generated JavaScript');
    for (const b of blocks) {
      if (b.type === 'repeat_end') {
        indent = Math.max(0, indent - 1);
        lines.push(`${pad()}}`);
        continue;
      }
      switch (b.type) {
        case 'led_on': lines.push(`${pad()}robot.setPin(13, 1);`); break;
        case 'led_off': lines.push(`${pad()}robot.setPin(13, 0);`); break;
        case 'servo_angle': lines.push(`${pad()}robot.setServo(9, ${Number(b.param ?? 90)});`); break;
        case 'motor_speed': lines.push(`${pad()}robot.setMotor(${Number(b.param ?? 80)});`); break;
        case 'buzzer_beep': lines.push(`${pad()}robot.beep(${Number(b.param ?? 660)});`); break;
        case 'lcd_show': lines.push(`${pad()}robot.lcd("${String(b.param ?? 'HI')}");`); break;
        case 'rover_forward': lines.push(`${pad()}rover.forward(${Number(b.param ?? 1)});`); break;
        case 'rover_left': lines.push(`${pad()}rover.turnLeft();`); break;
        case 'rover_right': lines.push(`${pad()}rover.turnRight();`); break;
        case 'if_obstacle': lines.push(`${pad()}if (sensor.cm < 20) rover.turnRight();`); break;
        case 'wait_sec': lines.push(`${pad()}await wait(${Number(b.param ?? 1)} * 1000);`); break;
        case 'print_msg': lines.push(`${pad()}console.log("${String(b.param ?? 'Hello')}");`); break;
        case 'repeat_start':
          lines.push(`${pad()}for (let i = 0; i < ${Number(b.param ?? 2)}; i++) {`);
          indent += 1;
          break;
      }
    }
    return lines.join('\n');
  }

  // Arduino C++
  lines.push('#include <Servo.h>');
  lines.push('Servo myServo;');
  lines.push('void setup() {');
  lines.push('  Serial.begin(9600);');
  lines.push('  pinMode(13, OUTPUT);');
  lines.push('  myServo.attach(9);');
  for (const b of blocks) {
    if (b.type === 'repeat_end') {
      indent = Math.max(0, indent - 1);
      lines.push(`  ${pad()}}`);
      continue;
    }
    switch (b.type) {
      case 'led_on': lines.push(`  ${pad()}digitalWrite(13, HIGH);`); break;
      case 'led_off': lines.push(`  ${pad()}digitalWrite(13, LOW);`); break;
      case 'servo_angle': lines.push(`  ${pad()}myServo.write(${Number(b.param ?? 90)});`); break;
      case 'motor_speed': lines.push(`  ${pad()}analogWrite(5, ${Math.round((Number(b.param ?? 80) / 100) * 255)});`); break;
      case 'buzzer_beep': lines.push(`  ${pad()}tone(8, ${Number(b.param ?? 660)}, 250);`); break;
      case 'lcd_show': lines.push(`  ${pad()}lcd.print("${String(b.param ?? 'HI')}");`); break;
      case 'rover_forward': lines.push(`  ${pad()}driveForward(${Number(b.param ?? 1)});`); break;
      case 'rover_left': lines.push(`  ${pad()}turnLeft90();`); break;
      case 'rover_right': lines.push(`  ${pad()}turnRight90();`); break;
      case 'if_obstacle': lines.push(`  ${pad()}if (getDistance() < 20) turnRight90();`); break;
      case 'wait_sec': lines.push(`  ${pad()}delay(${Number(b.param ?? 1) * 1000});`); break;
      case 'print_msg': lines.push(`  ${pad()}Serial.println("${String(b.param ?? 'Hello')}");`); break;
      case 'repeat_start':
        lines.push(`  ${pad()}for (int i = 0; i < ${Number(b.param ?? 2)}; i++) {`);
        indent += 1;
        break;
    }
  }
  lines.push('}');
  lines.push('void loop() {}');
  return lines.join('\n');
}

export interface CodingLesson {
  id: string;
  track: 'python' | 'web' | 'javascript' | 'cpp';
  title: string;
  titleHi: string;
  xp: number;
  goal: string;
  goalHi: string;
  starterCode: string;
  expectedOutputContains?: string;
}

export const CODING_LESSONS: CodingLesson[] = [
  {
    id: 'py_hello',
    track: 'python',
    title: '01. Python Variables & Loops',
    titleHi: '01. Python वेरिएबल और लूप सीखें',
    xp: 50,
    goal: 'Use a for loop to print countdown steps for a rocket launch.',
    goalHi: 'रॉकेट लॉन्च की उल्टी गिनती प्रिंट करने के लिए Python लूप चलाएँ।',
    starterCode: `name = "Robo Explorer"
print("Welcome,", name)

for count in range(5, 0, -1):
  print("Countdown:", count)

print("Liftoff!")`,
    expectedOutputContains: 'Liftoff',
  },
  {
    id: 'py_robot_math',
    track: 'python',
    title: '02. Python Sensor Threshold Logic',
    titleHi: '02. Python से सेंसर निर्णय लॉजिक',
    xp: 75,
    goal: 'Check sensor distance with if/else conditions to steer a robot safely.',
    goalHi: 'if/else से दूरी जांचकर रोबोट को सुरक्षित मोड़ने का कोड चलाएँ।',
    starterCode: `distances = [45, 18, 60, 12]

for d in distances:
  if d < 25:
    print("Distance", d, "cm -> STOP & TURN")
  else:
    print("Distance", d, "cm -> DRIVE FORWARD")`,
    expectedOutputContains: 'STOP & TURN',
  },
  {
    id: 'web_robot_card',
    track: 'web',
    title: '03. HTML & CSS Interactive Page',
    titleHi: '03. HTML व CSS से खुद की वेबसाइट बनाएँ',
    xp: 60,
    goal: 'Design a styled robot showcase webpage with HTML headings and CSS colors.',
    goalHi: 'HTML और CSS से रोबोट की सुंदर वेबसाइट बनाकर लाइव प्रिव्यू देखें।',
    starterCode: `<style>
  body { font-family: sans-serif; background: #f0f9ff; padding: 24px; }
  .card { background: white; border: 2px solid #0284c7; border-radius: 14px; padding: 20px; }
  h1 { color: #0369a1; margin-top: 0; }
  button { background: #059669; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; }
</style>

<div class="card">
  <h1>My First Robot Website</h1>
  <p>Built by a young engineer using HTML & CSS.</p>
  <button onclick="document.getElementById('msg').innerText='Motors Activated!'">Activate Robot</button>
  <p id="msg"></p>
</div>`,
  },
  {
    id: 'js_arrays',
    track: 'javascript',
    title: '04. JavaScript Functions & Arrays',
    titleHi: '04. JavaScript फ़ंक्शन और डेटा लिस्ट',
    xp: 70,
    goal: 'Write a JavaScript function that calculates total battery power across cells.',
    goalHi: 'बैटरी वोल्टेज जोड़ने वाला JavaScript फ़ंक्शन चलाएँ।',
    starterCode: `const cells = [1.5, 1.5, 1.5, 1.5];

function totalVoltage(list) {
  let sum = 0;
  for (const v of list) sum += v;
  return sum;
}

console.log("Cells:", cells.length);
console.log("Total Battery:", totalVoltage(cells), "Volts");`,
    expectedOutputContains: '6',
  },
  {
    id: 'cpp_arduino',
    track: 'cpp',
    title: '05. Arduino C++ Blink & Serial',
    titleHi: '05. Arduino C++ हार्डवेयर कोडिंग',
    xp: 80,
    goal: 'Program digitalWrite and Serial.println in C++ to control an Arduino LED.',
    goalHi: 'Arduino C++ में digitalWrite और Serial.println चलाकर हार्डवेयर कोड समझें।',
    starterCode: `void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  Serial.println("Arduino Uno Ready!");
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("LED -> ON (5V)");
  delay(500);
  digitalWrite(13, LOW);
  Serial.println("LED -> OFF (0V)");
}`,
    expectedOutputContains: 'LED -> ON',
  },
];
