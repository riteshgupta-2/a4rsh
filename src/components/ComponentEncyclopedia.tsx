import React, { useMemo, useState } from 'react';
import { ArrowRight, Search, ShieldAlert } from 'lucide-react';
import {
  ComponentCategory,
  ROBOTICS_COMPONENTS,
  ROBOTICS_PRACTICALS,
} from '../data/roboticsData';
import { LanguageCode, TranslationStrings } from '../i18n/translations';

interface ComponentEncyclopediaProps {
  lang: LanguageCode;
  t: TranslationStrings;
  onTryInLab: (practicalId: string) => void;
}

const CATEGORIES: { id: 'all' | ComponentCategory; labelEn: string; labelHi: string }[] = [
  { id: 'all', labelEn: 'All Components', labelHi: 'सभी कंपोनेंट्स' },
  { id: 'controller', labelEn: 'Microcontrollers', labelHi: 'माइक्रोकंट्रोलर' },
  { id: 'sensor', labelEn: 'Sensors', labelHi: 'सेंसर' },
  { id: 'actuator', labelEn: 'Motors & Actuators', labelHi: 'मोटर व एक्चुएटर' },
  { id: 'display', labelEn: 'LEDs & Displays', labelHi: 'LED व स्क्रीन' },
  { id: 'power', labelEn: 'Power', labelHi: 'पावर व बैटरी' },
];

export const ComponentEncyclopedia: React.FC<ComponentEncyclopediaProps> = ({
  lang,
  t,
  onTryInLab,
}) => {
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<'all' | ComponentCategory>('all');
  const isHi = lang === 'hi';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROBOTICS_COMPONENTS.filter((comp) => {
      if (category !== 'all' && comp.category !== category) return false;
      if (!q) return true;
      return (
        comp.name.toLowerCase().includes(q) ||
        comp.nameHi.toLowerCase().includes(q) ||
        comp.summary.toLowerCase().includes(q) ||
        comp.summaryHi.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  const findPracticalForComponent = (compId: string): string => {
    const match = ROBOTICS_PRACTICALS.find(
      (p) =>
        p.focusComponentId === compId ||
        p.components.some((c) => c.defId === compId)
    );
    return match ? match.id : ROBOTICS_PRACTICALS[0].id;
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Search & Category Filter */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-md shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-full bg-slate-200/45 p-1 backdrop-blur-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                category === cat.id
                  ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                  : 'border-transparent bg-white/25 text-slate-700 hover:border-white/80 hover:bg-white/60 hover:text-slate-900'
              }`}
            >
              {isHi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchComponents}
            aria-label={t.searchComponents}
            className="w-full rounded-lg border border-slate-200/80 bg-white/65 py-2 pl-9 pr-3 text-xs text-slate-900 backdrop-blur-sm focus:border-sky-600 focus:bg-white/95 focus:outline-none"
          />
        </div>
      </div>

      {/* Component Grid (zero-pill metadata, clean hairline cards) */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((comp) => (
          <article
            key={comp.id}
            className="flex flex-col justify-between rounded-2xl border border-white/70 bg-white/65 p-5 backdrop-blur-md shadow-sm transition-colors hover:bg-white/80"
          >
            <div>
              <div className="text-xs font-medium text-slate-500">
                <span className="capitalize">{comp.category}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono">{comp.voltage}</span>
              </div>

              <h3 className="mt-1.5 text-base font-bold text-slate-900">
                {isHi ? comp.nameHi : comp.name}
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isHi ? comp.summaryHi : comp.summary}
              </p>

              <div className="mt-4 space-y-2 border-t border-slate-200/60 pt-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-800">Pins: </span>
                  <span className="font-mono text-slate-600">
                    {comp.pins.map((p) => p.label).join(' · ')}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Uses: </span>
                  <span className="text-slate-600">{comp.realWorldUse}</span>
                </div>
                <div className="flex items-start gap-1.5 text-amber-800">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-600" aria-hidden="true" />
                  <span>{comp.safetyTip}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => onTryInLab(findPracticalForComponent(comp.id))}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-sky-400/75 bg-sky-500/20 px-4 py-2 text-xs font-semibold text-sky-950 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.22)] active:scale-95"
              >
                <span>{t.tryInLab}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-white/70 bg-white/65 p-10 text-center text-sm text-slate-500 backdrop-blur-md">
          {isHi ? 'कोई कंपोनेंट नहीं मिला। कृपया खोज बदलें।' : 'No matching robotics components found.'}
        </div>
      )}
    </section>
  );
};
