import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Lightbulb,
  ListChecks,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface BeginnerHintBoxProps {
  isHi: boolean;
  title: string;
  liveHint: string;
  steps: string[];
}

export const BeginnerHintBox: React.FC<BeginnerHintBoxProps> = ({
  isHi,
  title,
  liveHint,
  steps,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'all' | 'focus'>('all');
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const stepsKey = `${title}::${steps.join('|')}`;

  useEffect(() => {
    setCompletedIndices([]);
    setFocusIndex(0);
  }, [stepsKey]);

  const totalSteps = steps.length;
  const completedCount = completedIndices.length;
  const progressPct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const firstIncompleteIndex = steps.findIndex((_, idx) => !completedIndices.includes(idx));
  const currentActiveIndex = firstIncompleteIndex === -1 ? Math.max(0, totalSteps - 1) : firstIncompleteIndex;

  const toggleStep = (idx: number) => {
    setCompletedIndices((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      if (!prev.includes(idx) && idx + 1 < totalSteps) {
        setFocusIndex(idx + 1);
      }
      return next;
    });
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={isHi ? 'हिंट और गाइड खोलें' : 'Open Beginner Guide & Hints'}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2.5 rounded-full border border-amber-400/75 bg-white/55 px-4 py-2.5 text-xs font-semibold text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.14)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-500 hover:bg-amber-400/25 hover:shadow-[0_12px_28px_rgba(217,119,6,0.25)] active:scale-95"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/20 text-amber-700">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span>{isHi ? 'मदद और निर्देश' : 'Need a Hint?'}</span>
        {totalSteps > 0 && (
          <span className="text-[11px] font-medium text-slate-600 tabular-nums">
            · {completedCount}/{totalSteps}
          </span>
        )}
        <ChevronUp className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
      </button>
    );
  }

  const safeFocusIndex = Math.min(focusIndex, Math.max(0, totalSteps - 1));

  return (
    <aside
      aria-label={title}
      className="fixed bottom-4 right-4 z-40 w-[340px] sm:w-[390px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-white/80 bg-white/75 shadow-[0_20px_50px_rgba(15,23,42,0.16)] backdrop-blur-2xl"
    >
      {/* Frosted Header */}
      <div className="border-b border-white/70 bg-gradient-to-r from-amber-400/15 via-sky-400/10 to-white/30 px-4 py-3 backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-400/70 bg-amber-400/20 text-amber-700 shadow-sm">
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-slate-900">{title}</h4>
              <p className="text-[11px] text-slate-600 tabular-nums">
                {completedCount === totalSteps && totalSteps > 0
                  ? isHi
                    ? 'शाबाश! सभी चरण पूरे हुए'
                    : 'All steps completed!'
                  : isHi
                  ? `${completedCount} में से ${totalSteps} आसान कदम पूरे`
                  : `${completedCount} of ${totalSteps} simple steps done`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label={isHi ? 'हिंट बॉक्स छोटा करें' : 'Minimize hint box'}
            className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/40 px-3 py-1.5 text-[11px] font-semibold text-slate-700 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/80 hover:text-slate-900 hover:shadow-sm active:scale-95 shrink-0"
          >
            <span>{isHi ? 'छोटा करें' : 'Hide'}</span>
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Sleek Step Progress Bar */}
        {totalSteps > 0 && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70 border border-white/60">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 max-h-[54vh] overflow-y-auto">
        {/* Right-Now Action Callout */}
        <div className="rounded-2xl border border-amber-300/75 bg-gradient-to-br from-amber-400/15 via-amber-50/70 to-white/60 p-3 backdrop-blur-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
            <span>{isHi ? 'अभी क्या करें (Live Hint)' : 'What to do right now'}</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-800">{liveHint}</p>
        </div>

        {/* Checklist Header + View Mode Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
            <ListChecks className="h-4 w-4 text-sky-600 shrink-0" aria-hidden="true" />
            <span>{isHi ? 'आसान निर्देश (टैप करें)' : 'Step-by-Step Guide'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-200 active:scale-95 ${
                viewMode === 'all'
                  ? 'border-sky-400/80 bg-sky-500/20 text-sky-950'
                  : 'border-white/80 bg-white/40 text-slate-600 hover:bg-white/75'
              }`}
            >
              {isHi ? 'सभी' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('focus');
                setFocusIndex(currentActiveIndex);
              }}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md transition-all duration-200 active:scale-95 ${
                viewMode === 'focus'
                  ? 'border-sky-400/80 bg-sky-500/20 text-sky-950'
                  : 'border-white/80 bg-white/40 text-slate-600 hover:bg-white/75'
              }`}
            >
              {isHi ? '1-1 कदम' : '1-by-1'}
            </button>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setCompletedIndices([]);
                  setFocusIndex(0);
                }}
                title={isHi ? 'चेकलिस्ट रीसेट करें' : 'Reset checklist'}
                aria-label={isHi ? 'चेकलिस्ट रीसेट करें' : 'Reset checklist'}
                className="rounded-full border border-white/80 bg-white/40 p-1 text-slate-600 hover:bg-white/80 hover:text-slate-900 transition-all active:scale-95"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {viewMode === 'all' ? (
          <ol className="space-y-2">
            {steps.map((step, idx) => {
              const isDone = completedIndices.includes(idx);
              const isCurrent = !isDone && idx === currentActiveIndex;
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleStep(idx)}
                    className={`w-full flex items-start gap-2.5 rounded-2xl border p-2.5 text-left text-xs leading-relaxed backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99] ${
                      isDone
                        ? 'border-emerald-300/75 bg-emerald-500/10 text-slate-500'
                        : isCurrent
                        ? 'border-sky-400/75 bg-sky-500/10 text-slate-900 shadow-sm'
                        : 'border-white/75 bg-white/50 text-slate-700 hover:bg-white/80'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-800'
                          : isCurrent
                          ? 'border-sky-500 bg-sky-500/20 text-sky-900'
                          : 'border-slate-300 bg-white/75 text-slate-600'
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3" aria-hidden="true" /> : idx + 1}
                    </span>
                    <span className={isDone ? 'line-through decoration-emerald-500/50' : ''}>
                      {step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          /* Single-Step Focus Mode for Beginners */
          totalSteps > 0 && (
            <div className="space-y-2.5">
              <div
                className={`rounded-2xl border p-3.5 backdrop-blur-sm space-y-2 ${
                  completedIndices.includes(safeFocusIndex)
                    ? 'border-emerald-300/75 bg-emerald-500/10'
                    : 'border-sky-400/75 bg-sky-500/10'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-sky-900">
                  <span>
                    {isHi
                      ? `कदम ${safeFocusIndex + 1} / ${totalSteps}`
                      : `Step ${safeFocusIndex + 1} of ${totalSteps}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleStep(safeFocusIndex)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all active:scale-95 ${
                      completedIndices.includes(safeFocusIndex)
                        ? 'border-emerald-400/80 bg-emerald-500/20 text-emerald-900'
                        : 'border-sky-400/80 bg-white/70 text-sky-950 hover:bg-white'
                    }`}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span>
                      {completedIndices.includes(safeFocusIndex)
                        ? isHi
                          ? 'पूरा हुआ'
                          : 'Done'
                        : isHi
                        ? 'पूरा मार्क करें'
                        : 'Mark Done'}
                    </span>
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-slate-800">{steps[safeFocusIndex]}</p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={safeFocusIndex === 0}
                  onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-white/80 bg-white/45 px-3 py-1.5 text-[11px] font-semibold text-slate-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/80 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{isHi ? 'पिछला' : 'Previous'}</span>
                </button>
                <button
                  type="button"
                  disabled={safeFocusIndex >= totalSteps - 1}
                  onClick={() => setFocusIndex((i) => Math.min(totalSteps - 1, i + 1))}
                  className="inline-flex items-center gap-1 rounded-full border border-sky-400/75 bg-sky-500/20 px-3 py-1.5 text-[11px] font-semibold text-sky-950 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-sky-500/35 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  <span>{isHi ? 'अगला' : 'Next Step'}</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        )}

        <p className="text-[11px] text-slate-500">
          {isHi
            ? 'सुझाव: किसी भी कदम पर क्लिक करके उसे पूरा मार्क करें।'
            : 'Tip: Tap any step above to check it off as you build.'}
        </p>
      </div>
    </aside>
  );
};
