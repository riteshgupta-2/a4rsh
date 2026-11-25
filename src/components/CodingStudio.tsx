import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Code2,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  BLOCK_TEMPLATES,
  BlockType,
  CODING_LESSONS,
  CodeBlock,
  CodingLesson,
  transpileBlocks,
} from '../data/codingData';
import { LanguageCode, TranslationStrings } from '../i18n/translations';
import { BeginnerHintBox } from './BeginnerHintBox';
import {
  runArduinoCppSim,
  runJavaScriptSafe,
  runPythonSubset,
} from '../utils/codeRunner';

export type StudioTab = 'blocks' | 'python' | 'web' | 'javascript' | 'cpp';

export interface CodingNavRequest {
  tab?: StudioTab;
  lessonId?: string;
  nonce: number;
}

interface CodingStudioProps {
  lang: LanguageCode;
  t: TranslationStrings;
  blocks: CodeBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<CodeBlock[]>>;
  onRunRoverBlocks: () => void;
  onEarnXp: (lessonId: string, xp: number) => void;
  completedLessons: string[];
  defaultStudentName?: string;
  codingNavRequest?: CodingNavRequest;
}

export const CodingStudio: React.FC<CodingStudioProps> = ({
  lang,
  t,
  blocks,
  setBlocks,
  onRunRoverBlocks,
  onEarnXp,
  completedLessons,
  defaultStudentName = 'Young Inventor',
  codingNavRequest,
}) => {
  const [activeTab, setActiveTab] = useState<StudioTab>('blocks');
  const [transpileTarget, setTranspileTarget] = useState<'python' | 'javascript' | 'arduino'>('python');
  const [blockOutput, setBlockOutput] = useState<string[]>(['Click "Run Code" to test your blocks!']);

  const [pythonCode, setPythonCode] = useState<string>(CODING_LESSONS[0].starterCode);
  const [webCode, setWebCode] = useState<string>(CODING_LESSONS[2].starterCode);
  const [jsCode, setJsCode] = useState<string>(CODING_LESSONS[3].starterCode);
  const [cppCode, setCppCode] = useState<string>(CODING_LESSONS[4].starterCode);

  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [consoleError, setConsoleError] = useState<string | undefined>(undefined);
  const [activeLessonId, setActiveLessonId] = useState<string>(CODING_LESSONS[0].id);

  // Certificate modal state
  const [showCert, setShowCert] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>(defaultStudentName);

  useEffect(() => {
    setStudentName(defaultStudentName);
  }, [defaultStudentName]);

  useEffect(() => {
    if (!codingNavRequest) return;
    if (codingNavRequest.lessonId) {
      const targetLesson = CODING_LESSONS.find((l) => l.id === codingNavRequest.lessonId);
      if (targetLesson) {
        loadLesson(targetLesson);
        return;
      }
    }
    if (codingNavRequest.tab) {
      setActiveTab(codingNavRequest.tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codingNavRequest?.nonce]);

  const isHi = lang === 'hi';

  const generatedCode = useMemo(
    () => transpileBlocks(blocks, transpileTarget),
    [blocks, transpileTarget]
  );

  const addBlock = (type: BlockType) => {
    const tpl = BLOCK_TEMPLATES.find((b) => b.type === type);
    setBlocks((prev) => [
      ...prev,
      { uid: `b_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, type, param: tpl?.defaultParam },
    ]);
  };

  const updateBlockParam = (uid: string, value: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.uid === uid ? { ...b, param: value } : b))
    );
  };

  const moveBlock = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const removeBlock = (uid: string) => {
    setBlocks((prev) => prev.filter((b) => b.uid !== uid));
  };

  const runBlocks = () => {
    const out: string[] = [];
    let i = 0;
    const execOne = (b: CodeBlock) => {
      switch (b.type) {
        case 'led_on': out.push('Pin 13 LED -> ON (5.0V)'); break;
        case 'led_off': out.push('Pin 13 LED -> OFF (0.0V)'); break;
        case 'servo_angle': out.push(`Servo Motor rotated to ${b.param ?? 90}°`); break;
        case 'motor_speed': out.push(`DC Motor speed set to ${b.param ?? 80}%`); break;
        case 'buzzer_beep': out.push(`Piezo Buzzer playing ${b.param ?? 660} Hz tone`); break;
        case 'lcd_show': out.push(`16x2 LCD Display: "${String(b.param ?? '')}"`); break;
        case 'rover_forward': out.push(`Rover moved forward ${b.param ?? 1} step(s)`); break;
        case 'rover_left': out.push('Rover turned Left 90°'); break;
        case 'rover_right': out.push('Rover turned Right 90°'); break;
        case 'if_obstacle': out.push('Checked Ultrasonic Sensor (< 20 cm obstacle rule)'); break;
        case 'wait_sec': out.push(`Waited ${b.param ?? 1} second(s)`); break;
        case 'print_msg': out.push(String(b.param ?? '')); break;
      }
    };

    while (i < blocks.length) {
      const b = blocks[i];
      if (b.type === 'repeat_start') {
        const count = Math.min(8, Math.max(1, Number(b.param ?? 2)));
        const inner: CodeBlock[] = [];
        i++;
        while (i < blocks.length && blocks[i].type !== 'repeat_end') {
          inner.push(blocks[i]);
          i++;
        }
        for (let r = 0; r < count; r++) {
          inner.forEach(execOne);
        }
      } else if (b.type !== 'repeat_end') {
        execOne(b);
      }
      i++;
    }
    setBlockOutput(out.length ? out : ['Add blocks to run your program!']);
    onEarnXp('blocks_practice', 30);
  };

  const handleRunTextCode = () => {
    setConsoleError(undefined);
    if (activeTab === 'python') {
      const res = runPythonSubset(pythonCode);
      setConsoleLogs(res.logs);
      setConsoleError(res.error);
      if (!res.error) onEarnXp(activeLessonId, 50);
    } else if (activeTab === 'javascript') {
      const res = runJavaScriptSafe(jsCode);
      setConsoleLogs(res.logs);
      setConsoleError(res.error);
      if (!res.error) onEarnXp(activeLessonId, 50);
    } else if (activeTab === 'cpp') {
      const res = runArduinoCppSim(cppCode);
      setConsoleLogs(res.logs);
      setConsoleError(res.error);
      if (!res.error) onEarnXp(activeLessonId, 50);
    } else if (activeTab === 'web') {
      onEarnXp(activeLessonId, 50);
    }
  };

  const loadLesson = (lesson: CodingLesson) => {
    setActiveLessonId(lesson.id);
    setConsoleLogs([]);
    setConsoleError(undefined);
    if (lesson.track === 'python') {
      setActiveTab('python');
      setPythonCode(lesson.starterCode);
    } else if (lesson.track === 'web') {
      setActiveTab('web');
      setWebCode(lesson.starterCode);
    } else if (lesson.track === 'javascript') {
      setActiveTab('javascript');
      setJsCode(lesson.starterCode);
    } else if (lesson.track === 'cpp') {
      setActiveTab('cpp');
      setCppCode(lesson.starterCode);
    }
  };

  const activeEditorValue =
    activeTab === 'python'
      ? pythonCode
      : activeTab === 'web'
      ? webCode
      : activeTab === 'javascript'
      ? jsCode
      : cppCode;

  const setActiveEditorValue = (val: string) => {
    if (activeTab === 'python') setPythonCode(val);
    else if (activeTab === 'web') setWebCode(val);
    else if (activeTab === 'javascript') setJsCode(val);
    else if (activeTab === 'cpp') setCppCode(val);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 p-3 backdrop-blur-md shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-slate-200/45 p-1 backdrop-blur-sm">
          {(
            [
              ['blocks', t.codingBlocksTab],
              ['python', t.codingPythonTab],
              ['web', t.codingWebTab],
              ['javascript', t.codingJsTab],
              ['cpp', t.codingCppTab],
            ] as [StudioTab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                activeTab === id
                  ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                  : 'border-transparent bg-white/25 text-slate-700 hover:border-white/80 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowCert(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/70 bg-amber-400/15 px-4 py-2 text-xs font-semibold text-amber-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-400/30 hover:border-amber-500 hover:shadow-[0_6px_18px_rgba(217,119,6,0.2)] active:scale-95 whitespace-nowrap"
        >
          <Award className="h-4 w-4 text-amber-600" aria-hidden="true" />
          <span>{t.certificateBtn}</span>
        </button>
      </div>

      {/* VISUAL BLOCK CODING TAB */}
      {activeTab === 'blocks' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Block Palette (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t.addBlockTitle}</h3>
            <div className="grid grid-cols-1 gap-2">
              {BLOCK_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  type="button"
                  onClick={() => addBlock(tpl.type)}
                  className={`flex items-center justify-between rounded-full px-4 py-2 text-left text-xs font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${tpl.colorClass}`}
                >
                  <span>{isHi ? tpl.labelHi : tpl.label}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 opacity-85" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Stack + Output (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  {isHi ? 'आपका ब्लॉक प्रोग्राम' : 'Your Block Stack'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={runBlocks}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.24)] active:scale-95 whitespace-nowrap"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.runCode}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onRunRoverBlocks}
                    className="rounded-full border border-sky-400/75 bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95 whitespace-nowrap"
                  >
                    {isHi ? 'रोवर पर चलाएँ' : 'Run on Rover'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {blocks.map((block, index) => {
                  const tpl = BLOCK_TEMPLATES.find((x) => x.type === block.type);
                  if (!tpl) return null;
                  return (
                    <div
                      key={block.uid}
                      className={`flex items-center justify-between gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition-all duration-200 ${tpl.colorClass}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="truncate">{isHi ? tpl.labelHi : tpl.label}</span>
                        {tpl.defaultParam !== undefined && (
                          <input
                            type={typeof tpl.defaultParam === 'number' ? 'number' : 'text'}
                            value={block.param ?? ''}
                            onChange={(e) => updateBlockParam(block.uid, e.target.value)}
                            aria-label={`${tpl.label} value`}
                            className="w-24 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-mono text-slate-900 focus:outline-none"
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => moveBlock(index, -1)}
                          aria-label="Move block up"
                          className="rounded-full p-1 transition-all duration-150 hover:bg-white/60 hover:scale-110 active:scale-95"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveBlock(index, 1)}
                          aria-label="Move block down"
                          className="rounded-full p-1 transition-all duration-150 hover:bg-white/60 hover:scale-110 active:scale-95"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.uid)}
                          aria-label="Delete block"
                          className="rounded-full p-1 transition-all duration-150 hover:bg-rose-500/25 hover:text-rose-900 hover:scale-110 active:scale-95"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {blocks.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-500">
                    {isHi ? 'बाएँ पैनल से ब्लॉक जोड़ें।' : 'Click any block on the left to build your program.'}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
              <h4 className="text-xs font-semibold text-slate-900 mb-2">
                {isHi ? 'आउटपुट कंसोल' : 'Block Execution Output'}
              </h4>
              <div className="rounded-lg bg-slate-900/90 p-3 font-mono text-xs text-emerald-300 backdrop-blur-sm space-y-1 max-h-44 overflow-y-auto">
                {blockOutput.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Transpiled Code (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-slate-900">{t.generatedCodeTitle}</h3>
              <div className="flex items-center gap-1 rounded-full bg-slate-200/45 p-1 backdrop-blur-sm">
                {(['python', 'javascript', 'arduino'] as const).map((tgt) => (
                  <button
                    key={tgt}
                    type="button"
                    onClick={() => setTranspileTarget(tgt)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                      transpileTarget === tgt
                        ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                        : 'border-transparent bg-white/25 text-slate-700 hover:bg-white/60 hover:text-slate-900'
                    }`}
                  >
                    {tgt === 'arduino' ? 'C++' : tgt}
                  </button>
                ))}
              </div>
            </div>
            <pre className="overflow-x-auto rounded-lg border border-slate-200/60 bg-slate-950/90 p-3.5 font-mono text-xs leading-relaxed text-sky-200">
              {generatedCode}
            </pre>
          </div>
        </div>
      )}

      {/* TEXT CODE STUDIO (Python / HTML & CSS / JS / C++) */}
      {activeTab !== 'blocks' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Code Editor & Output (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-200/60 bg-white/50 px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Code2 className="h-4 w-4 text-sky-600" aria-hidden="true" />
                  <span>
                    {activeTab === 'python'
                      ? 'main.py — Python'
                      : activeTab === 'web'
                      ? 'index.html — HTML & CSS'
                      : activeTab === 'javascript'
                      ? 'app.js — JavaScript'
                      : 'sketch.ino — Arduino C++'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConsoleLogs([]);
                      setConsoleError(undefined);
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/30 px-3 py-1.5 text-xs font-medium text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-sm active:scale-95"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.clearOutput}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRunTextCode}
                    className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/75 bg-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.24)] active:scale-95"
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.runCode}</span>
                  </button>
                </div>
              </div>

              <textarea
                value={activeEditorValue}
                onChange={(e) => setActiveEditorValue(e.target.value)}
                spellCheck={false}
                aria-label="Code Editor"
                className="h-72 w-full resize-y bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
              />
            </div>

            {/* Live Preview or Console */}
            {activeTab === 'web' ? (
              <div className="rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md shadow-sm overflow-hidden">
                <div className="border-b border-slate-200/60 bg-white/50 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm">
                  {isHi ? 'लाइव वेबसाइट प्रिव्यू' : 'Live Webpage Preview'}
                </div>
                <iframe
                  title="HTML CSS Live Preview"
                  sandbox="allow-scripts"
                  srcDoc={webCode}
                  className="h-64 w-full bg-white"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
                <h4 className="text-xs font-semibold text-slate-900 mb-2">
                  {isHi ? 'प्रोग्राम आउटपुट (Console)' : 'Program Output Console'}
                </h4>
                <div className="min-h-28 rounded-lg bg-slate-900/90 p-3.5 font-mono text-xs backdrop-blur-sm space-y-1">
                  {consoleLogs.length === 0 && !consoleError && (
                    <span className="text-slate-400">
                      {isHi ? 'परिणाम देखने के लिए "कोड चलाएँ" दबाएँ।' : 'Press "Run Code" to see live output.'}
                    </span>
                  )}
                  {consoleLogs.map((log, i) => (
                    <div key={i} className="text-emerald-300">{log}</div>
                  ))}
                  {consoleError && <div className="text-rose-400">Error: {consoleError}</div>}
                </div>
              </div>
            )}
          </div>

          {/* Structured Free Lessons (4 cols) */}
          <aside className="lg:col-span-4 rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-900">{t.lessonsTitle}</h3>
            </div>

            <div className="space-y-2.5">
              {CODING_LESSONS.map((lesson) => {
                const done = completedLessons.includes(lesson.id);
                const selected = activeLessonId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => loadLesson(lesson)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors backdrop-blur-sm ${
                      selected
                        ? 'border-sky-500/80 bg-sky-50/75'
                        : 'border-white/70 bg-white/55 hover:bg-white/85'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">
                        {isHi ? lesson.titleHi : lesson.title}
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-emerald-700 shrink-0">
                        {done ? 'Done' : `+${lesson.xp} XP`}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">
                      {isHi ? lesson.goalHi : lesson.goal}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {/* Printable Certificate Modal */}
      {showCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {isHi ? 'छात्र रोबोटिक्स व कोडिंग सर्टिफिकेट' : 'Student STEM Achievement Certificate'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCert(false)}
                className="rounded-full border border-white/75 bg-white/30 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm active:scale-95"
              >
                Close
              </button>
            </div>

            <label className="block text-xs font-medium text-slate-700">
              {isHi ? 'छात्र का नाम लिखें:' : 'Enter Student Name:'}
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2 text-sm text-slate-900"
              />
            </label>

            <div className="rounded-xl border-2 border-sky-600 bg-white/65 p-6 text-center backdrop-blur-sm space-y-2">
              <div className="text-xs font-semibold tracking-wider text-sky-700">HARRBOTIX ACADEMY</div>
              <div className="text-xl font-bold text-slate-900">{studentName || 'Young Engineer'}</div>
              <p className="text-xs text-slate-600">
                {isHi
                  ? 'रोबोटिक्स सर्किट प्रैक्टिकल और कंप्यूटर कोडिंग के सफलतापूर्वक अभ्यास के लिए सम्मानित किया जाता है।'
                  : 'Recognized for hands-on robotics circuit building and computer programming practice.'}
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500">
                Completed Lessons: {completedLessons.length} · Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full border border-sky-400/75 bg-sky-500/20 px-5 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.24)] active:scale-95"
              >
                {isHi ? 'प्रिंट / PDF सेव करें' : 'Print / Save PDF'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BeginnerHintBox
        isHi={isHi}
        title={isHi ? 'कोडिंग प्रोजेक्ट गाइड (Beginner)' : 'Coding Project Guide & Hints'}
        liveHint={
          activeTab === 'blocks'
            ? blocks.length === 0
              ? isHi
                ? 'बाईं ओर से कोई भी रंगीन ब्लॉक (जैसे Move Rover Forward या Turn LED ON) क्लिक करके जोड़ें!'
                : 'Click any colored block on the left (like Move Rover Forward or Turn LED ON) to start building!'
              : isHi
              ? 'ब्लॉक्स का नंबर बदलें या ऊपर-नीचे करें, फिर "Run Code" या "Run on Rover" दबाएँ!'
              : 'Edit block numbers/text or reorder with ↑/↓, then click "Run Code" or "Run on Rover" to test!'
            : activeTab === 'web'
            ? isHi
              ? 'बाईं ओर HTML/CSS बदलें — दाईं ओर आपका वेब पेज तुरंत अपडेट होगा!'
              : 'Edit the HTML/CSS on the left — your live webpage preview updates automatically on the right!'
            : isHi
            ? 'नीचे से कोई आसान पाठ (Lesson) चुनें, कोड बदलें और "Run Code" दबाकर आउटपुट देखें!'
            : 'Pick a starter lesson below, customize the code in the editor, and click "Run Code" to see live output!'
        }
        steps={
          activeTab === 'blocks'
            ? isHi
              ? [
                  'बाईं ओर से कमांड ब्लॉक चुनें (LED, Servo, Rover, या Repeat)।',
                  'दाईं ओर अपने ब्लॉक्स का असली Python, JavaScript और Arduino C++ कोड देखें।',
                  '"Run Code" से आउटपुट जाँचें या "Run on Rover" से रोबोट को चलाएँ।',
                ]
              : [
                  'Pick blocks from the left palette (LED, Servo, Rover Drive, or Repeat loops).',
                  'Watch your blocks automatically convert into real Python, JavaScript, and Arduino C++ on the right.',
                  'Click "Run Code" to test output, or "Run on Rover" to drive your robot in the arena.',
                ]
            : activeTab === 'web'
            ? isHi
              ? [
                  'HTML टैग (जैसे <h1>, <p>, <button>) लिखें या रंग/टेक्स्ट बदलें।',
                  'दाईं ओर लाइव वेबपेज प्रिव्यू देखें।',
                  'XP कमाने के लिए "Run Code" दबाएँ।',
                ]
              : [
                  'Edit HTML headings, text, or CSS styles in the code box.',
                  'Watch the live interactive webpage preview update instantly on the right.',
                  'Click "Run Code" when ready to earn lesson XP.',
                ]
            : isHi
            ? [
                'नीचे दिए गए आसान लेसन कार्ड में से कोई एक चुनें।',
                'एडिटर में संख्या या संदेश (print/console.log) बदलकर प्रयोग करें।',
                '"Run Code" दबाकर नीचे कंसोल में परिणाम देखें।',
              ]
            : [
                'Select any starter lesson card below to load example code.',
                'Experiment by changing numbers, sensor values, or print messages in the editor.',
                'Click "Run Code" to run your code safely and view console output.',
              ]
        }
      />
    </section>
  );
};
