import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  CheckCircle2,
  Cpu,
  Tag,
  X,
} from 'lucide-react';
import {
  PlacedComponent,
  PracticalEnvState,
  PracticalSimulationResult,
  ROBOTICS_COMPONENTS,
  ROBOTICS_PRACTICALS,
  WireConnection,
  getComponentDef,
} from '../data/roboticsData';
import { LanguageCode, TranslationStrings } from '../i18n/translations';
import { BeginnerHintBox } from './BeginnerHintBox';
import { CircuitComponentSvg } from './CircuitComponentSvg';

interface RoboticsLabProps {
  lang: LanguageCode;
  t: TranslationStrings;
  initialPracticalId?: string;
  onCompletePractical: (practicalId: string) => void;
}

const DEFAULT_ENV: PracticalEnvState = {
  distanceCm: 42,
  lightPercent: 60,
  temperatureC: 26,
  humidityPercent: 52,
  moisturePercent: 48,
  potentiometerPercent: 60,
  buttonPressed: false,
  irDetected: false,
};

const WIRE_COLORS = ['#0284C7', '#059669', '#D97706', '#DC2626', '#7C3AED'];

export const RoboticsLab: React.FC<RoboticsLabProps> = ({
  lang,
  t,
  initialPracticalId,
  onCompletePractical,
}) => {
  const [selectedPracticalId, setSelectedPracticalId] = useState<string>(
    initialPracticalId || ROBOTICS_PRACTICALS[0].id
  );
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>(
    ROBOTICS_PRACTICALS[0].components
  );
  const [wires, setWires] = useState<WireConnection[]>(ROBOTICS_PRACTICALS[0].wires);
  const [env, setEnv] = useState<PracticalEnvState>(DEFAULT_ENV);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [tick, setTick] = useState<number>(0);
  const [motorDeg, setMotorDeg] = useState<number>(0);
  const [selectedPin, setSelectedPin] = useState<{ instanceId: string; pinId: string } | null>(null);
  const [hoveredPin, setHoveredPin] = useState<{ instanceId: string; pinId: string } | null>(null);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [showWireLabels, setShowWireLabels] = useState<boolean>(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [addDefId, setAddDefId] = useState<string>(ROBOTICS_COMPONENTS[0].id);
  const [showCode, setShowCode] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const activePractical = useMemo(
    () => ROBOTICS_PRACTICALS.find((p) => p.id === selectedPracticalId) || ROBOTICS_PRACTICALS[0],
    [selectedPracticalId]
  );

  // Sync when initialPracticalId changes from Encyclopedia
  useEffect(() => {
    if (initialPracticalId) {
      loadPractical(initialPracticalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPracticalId]);

  const loadPractical = (id: string) => {
    if (id === 'freeform') {
      setSelectedPracticalId('freeform');
      setPlacedComponents([{ instanceId: 'mcu_free', defId: 'arduino_uno', x: 45, y: 165 }]);
      setWires([]);
      setIsRunning(true);
      setSelectedPin(null);
      setSelectedWireId(null);
      setHoveredWireId(null);
      return;
    }
    const found = ROBOTICS_PRACTICALS.find((p) => p.id === id);
    if (!found) return;
    setSelectedPracticalId(found.id);
    setPlacedComponents(found.components.map((c) => ({ ...c })));
    setWires(found.wires.map((w) => ({ ...w })));
    setEnv(DEFAULT_ENV);
    setIsRunning(true);
    setSelectedPin(null);
    setSelectedWireId(null);
    setHoveredWireId(null);
    onCompletePractical(found.id);
  };

  // Simulation heartbeat
  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setTick((prev) => prev + 1);
    }, 650);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const simResult: PracticalSimulationResult = useMemo(() => {
    if (selectedPracticalId === 'freeform') {
      // Dynamic freeform circuit evaluation based on wired connections
      const ledStates: Record<string, boolean> = {};
      const ledBrightness: Record<string, number> = {};
      let buzzerFreq = 0;
      let motorRpm = 0;
      let servoAngle = 0;
      const hasPower = wires.length > 0;

      placedComponents.forEach((comp) => {
        const isConnected = wires.some(
          (w) => w.fromInstanceId === comp.instanceId || w.toInstanceId === comp.instanceId
        );
        if (comp.defId === 'led_bulb') {
          ledStates[comp.instanceId] = isConnected && isRunning;
          ledBrightness[comp.instanceId] = isConnected && isRunning ? 100 : 0;
        }
        if (comp.defId === 'buzzer' && isConnected && isRunning && tick % 2 === 0) {
          buzzerFreq = 587;
        }
        if (comp.defId === 'dc_motor' && isConnected && isRunning) {
          motorRpm = 160;
        }
        if (comp.defId === 'servo_motor' && isConnected && isRunning) {
          servoAngle = tick % 2 === 0 ? 90 : 0;
        }
      });

      return {
        ledStates,
        ledBrightness,
        servoAngle,
        motorRpm,
        buzzerFreq,
        relayClosed: hasPower,
        lcdLine1: 'FREEFORM LAB',
        lcdLine2: `WIRES: ${wires.length}`,
        sevenSegChar: String(Math.min(9, wires.length)),
        pinStates: [
          {
            pin: 'Workbench Bus',
            state: hasPower ? 'CONNECTED' : 'OPEN',
            voltage: hasPower ? '5.0V' : '0.0V',
            active: hasPower,
          },
        ],
        serialLogs: [`Freeform Circuit: ${placedComponents.length} parts, ${wires.length} wires`],
      };
    }

    // Check if circuit still has at least one wire
    if (wires.length === 0) {
      return {
        ledStates: {},
        ledBrightness: {},
        servoAngle: 0,
        motorRpm: 0,
        buzzerFreq: 0,
        relayClosed: false,
        lcdLine1: 'NO WIRES',
        lcdLine2: 'CONNECT PINS',
        sevenSegChar: '0',
        pinStates: [{ pin: 'Circuit', state: 'OPEN', voltage: '0.0V', active: false }],
        serialLogs: ['Circuit open — connect pins to run practical'],
      };
    }

    return activePractical.simulate(env, tick);
  }, [selectedPracticalId, activePractical, env, tick, wires, placedComponents, isRunning]);

  // Smooth DC motor rotation loop
  useEffect(() => {
    if (!isRunning || simResult.motorRpm <= 0) return;
    let frameId: number;
    const step = () => {
      setMotorDeg((prev) => (prev + Math.max(2, simResult.motorRpm / 18)) % 360);
      frameId = requestAnimationFrame(step);
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, simResult.motorRpm]);

  // Safe Web Audio API Piezo Buzzer tone
  useEffect(() => {
    if (!soundEnabled || !isRunning || simResult.buzzerFreq <= 0) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = simResult.buzzerFreq;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {
      // Ignore Web Audio restriction errors silently
    }
  }, [soundEnabled, isRunning, simResult.buzzerFreq, tick]);

  const toSvgCoords = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 880,
      y: ((clientY - rect.top) / rect.height) * 460,
    };
  };

  const handleMouseDownBody = (e: React.MouseEvent, instanceId: string) => {
    const comp = placedComponents.find((c) => c.instanceId === instanceId);
    if (!comp) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    setDraggingId(instanceId);
    setDragOffset({ dx: pt.x - comp.x, dy: pt.y - comp.y });
  };

  const handleSvgMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const pt = toSvgCoords(e.clientX, e.clientY);
    setPlacedComponents((prev) =>
      prev.map((c) =>
        c.instanceId === draggingId
          ? {
              ...c,
              x: Math.max(14, Math.min(710, Math.round(pt.x - dragOffset.dx))),
              y: Math.max(14, Math.min(350, Math.round(pt.y - dragOffset.dy))),
            }
          : c
      )
    );
  };

  const handleSvgMouseUp = () => {
    setDraggingId(null);
  };

  const handlePinClick = (instanceId: string, pinId: string) => {
    if (!selectedPin) {
      setSelectedPin({ instanceId, pinId });
      return;
    }
    if (selectedPin.instanceId === instanceId && selectedPin.pinId === pinId) {
      setSelectedPin(null);
      return;
    }
    const newWire: WireConnection = {
      id: `w_${Date.now()}`,
      fromInstanceId: selectedPin.instanceId,
      fromPinId: selectedPin.pinId,
      toInstanceId: instanceId,
      toPinId: pinId,
      color: WIRE_COLORS[wires.length % WIRE_COLORS.length],
    };
    setWires((prev) => [...prev, newWire]);
    setSelectedPin(null);
  };

  const handleAddComponent = () => {
    const def = getComponentDef(addDefId);
    if (!def) return;
    const nextComp: PlacedComponent = {
      instanceId: `comp_${Date.now()}`,
      defId: def.id,
      x: 320 + ((placedComponents.length * 75) % 360),
      y: 45 + ((placedComponents.length * 85) % 260),
      colorVariant: 'emerald',
    };
    setPlacedComponents((prev) => [...prev, nextComp]);
  };

  const handleRemoveComponent = (instanceId: string) => {
    setPlacedComponents((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setWires((prev) =>
      prev.filter((w) => w.fromInstanceId !== instanceId && w.toInstanceId !== instanceId)
    );
    setSelectedWireId(null);
  };

  const handleRemoveWire = (wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
    if (selectedWireId === wireId) setSelectedWireId(null);
    if (hoveredWireId === wireId) setHoveredWireId(null);
  };

  const getPinAbsCoords = (instanceId: string, pinId: string) => {
    const comp = placedComponents.find((c) => c.instanceId === instanceId);
    if (!comp) return null;
    const def = getComponentDef(comp.defId);
    const pin = def?.pins.find((p) => p.id === pinId);
    if (!pin) return null;
    return { x: comp.x + pin.rx, y: comp.y + pin.ry };
  };

  const isHi = lang === 'hi';

  const getCompDisplayName = (instanceId: string) => {
    const comp = placedComponents.find((c) => c.instanceId === instanceId);
    if (!comp) return instanceId;
    const def = getComponentDef(comp.defId);
    if (!def) return instanceId;
    if (comp.label) {
      return def.id === 'led_bulb' ? `${comp.label} LED` : `${comp.label} (${isHi ? def.nameHi : def.name})`;
    }
    const raw = isHi ? def.nameHi : def.name;
    return raw.replace(/\s*\(.*?\)\s*/g, '').trim();
  };

  const getPinDisplayLabel = (instanceId: string, pinId: string) => {
    const comp = placedComponents.find((c) => c.instanceId === instanceId);
    const def = comp ? getComponentDef(comp.defId) : undefined;
    const pin = def?.pins.find((p) => p.id === pinId);
    return pin?.label || pinId;
  };

  const activeWireIds = useMemo(() => {
    const ids = new Set<string>();
    if (hoveredWireId) ids.add(hoveredWireId);
    if (selectedWireId) ids.add(selectedWireId);
    if (!hoveredWireId && !selectedWireId && hoveredPin) {
      wires.forEach((w) => {
        if (
          (w.fromInstanceId === hoveredPin.instanceId && w.fromPinId === hoveredPin.pinId) ||
          (w.toInstanceId === hoveredPin.instanceId && w.toPinId === hoveredPin.pinId)
        ) {
          ids.add(w.id);
        }
      });
    }
    return ids;
  }, [hoveredWireId, selectedWireId, hoveredPin, wires]);

  const highlightedPinsByInstance = useMemo(() => {
    const map = new Map<string, string[]>();
    wires.forEach((w) => {
      if (!activeWireIds.has(w.id)) return;
      map.set(w.fromInstanceId, [...(map.get(w.fromInstanceId) || []), w.fromPinId]);
      map.set(w.toInstanceId, [...(map.get(w.toInstanceId) || []), w.toPinId]);
    });
    return map;
  }, [wires, activeWireIds]);

  const inspectedWire = useMemo(() => {
    const id = hoveredWireId || selectedWireId;
    if (!id) return null;
    const idx = wires.findIndex((w) => w.id === id);
    if (idx === -1) return null;
    return { wire: wires[idx], index: idx };
  }, [wires, hoveredWireId, selectedWireId]);

  const showAllSensors = selectedPracticalId === 'freeform';
  const hasSensor = (key: keyof PracticalEnvState) =>
    showAllSensors || activePractical.requiredSensors.includes(key);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT STAGE: 65% (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Add Component & Playback Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 p-3.5 backdrop-blur-md shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label={t.addComponent}
                value={addDefId}
                onChange={(e) => setAddDefId(e.target.value)}
                className="rounded-lg border border-slate-200/80 bg-white/75 px-3 py-2 text-xs font-medium text-slate-800 backdrop-blur-sm focus:border-sky-600 focus:outline-none"
              >
                {ROBOTICS_COMPONENTS.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {isHi ? comp.nameHi : comp.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddComponent}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/30 px-4 py-2 text-xs font-semibold text-slate-900 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-[0_6px_18px_rgba(2,132,199,0.16)] active:scale-95 whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
                <span>{t.addComponent}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRunning((r) => !r)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  isRunning
                    ? 'border-amber-400/75 bg-amber-500/20 text-amber-950 hover:bg-amber-500/35 hover:border-amber-500 hover:shadow-[0_6px_18px_rgba(217,119,6,0.25)]'
                    : 'border-emerald-400/75 bg-emerald-500/20 text-emerald-950 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.25)]'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.pausePractical}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.runPractical}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => loadPractical(selectedPracticalId)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/30 px-3.5 py-2 text-xs font-medium text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)] active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.resetPractical}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWires([]);
                  setSelectedWireId(null);
                  setHoveredWireId(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/30 px-3.5 py-2 text-xs font-medium text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300/80 hover:bg-rose-500/15 hover:text-rose-900 hover:shadow-[0_6px_18px_rgba(225,29,72,0.15)] active:scale-95 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.clearWires}</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundEnabled((s) => !s)}
                aria-label={soundEnabled ? 'Mute Buzzer Audio' : 'Enable Buzzer Audio'}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-xs font-medium backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  soundEnabled
                    ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 hover:bg-sky-500/35 hover:shadow-[0_6px_18px_rgba(2,132,199,0.2)]'
                    : 'border-white/80 bg-white/30 text-slate-700 hover:border-sky-300/80 hover:bg-white/60 hover:text-slate-900 hover:shadow-sm'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>Audio</span>
              </button>
            </div>
          </div>

          {/* Interactive Circuit Canvas */}
          <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/65 backdrop-blur-md shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 bg-white/45 px-4 py-2.5 text-xs text-slate-600 backdrop-blur-sm">
              <span>
                {selectedPin
                  ? isHi
                    ? `पिन चुना गया: ${getCompDisplayName(selectedPin.instanceId)} (${getPinDisplayLabel(selectedPin.instanceId, selectedPin.pinId)}) — अब दूसरी पिन पर क्लिक करें`
                    : `Selected pin: ${getCompDisplayName(selectedPin.instanceId)} (${getPinDisplayLabel(selectedPin.instanceId, selectedPin.pinId)}) — click target pin to connect`
                  : t.wiringHint}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowWireLabels((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                    showWireLabels
                      ? 'border-sky-400/75 bg-sky-500/20 text-sky-950 shadow-sm'
                      : 'border-white/80 bg-white/30 text-slate-700 hover:border-sky-300/80 hover:bg-white/65 hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  <span>{isHi ? 'पिन टैग दिखाएँ' : 'Show Pin Tags'}</span>
                </button>
                <span className="font-mono tabular-nums text-slate-500">
                  {placedComponents.length} parts · {wires.length} wires
                </span>
              </div>
            </div>

            <div className="relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50/50">
              <svg
                ref={svgRef}
                viewBox="0 0 880 460"
                className="h-[380px] w-full sm:h-[460px] touch-none"
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseUp}
                onClick={() => {
                  setSelectedWireId(null);
                  setSelectedPin(null);
                }}
              >
                {/* Jumper Wires */}
                {wires.map((wire, idx) => {
                  const p1 = getPinAbsCoords(wire.fromInstanceId, wire.fromPinId);
                  const p2 = getPinAbsCoords(wire.toInstanceId, wire.toPinId);
                  if (!p1 || !p2) return null;

                  const laneOffset = (idx - (wires.length - 1) / 2) * 22;
                  const mx = (p1.x + p2.x) / 2;
                  const dy = p2.y - p1.y;
                  const curveSpread = Math.max(36, Math.abs(dy) * 0.45) + Math.abs(laneOffset) * 0.75;
                  const c1x = mx + laneOffset * 0.75;
                  const c1y = p1.y + (p1.y <= p2.y ? curveSpread : -curveSpread) * 0.55 + laneOffset * 0.45;
                  const c2x = mx - laneOffset * 0.75;
                  const c2y = p2.y - (p1.y <= p2.y ? curveSpread : -curveSpread) * 0.55 + laneOffset * 0.45;
                  const d = `M ${p1.x} ${p1.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;

                  const hasAnyFocus = activeWireIds.size > 0;
                  const isActive = activeWireIds.has(wire.id);
                  const wireOpacity = hasAnyFocus ? (isActive ? 1 : 0.2) : 0.88;
                  const fromPinLabel = getPinDisplayLabel(wire.fromInstanceId, wire.fromPinId);
                  const toPinLabel = getPinDisplayLabel(wire.toInstanceId, wire.toPinId);

                  return (
                    <g
                      key={wire.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWireId(wire.id)}
                      onMouseLeave={() => setHoveredWireId((curr) => (curr === wire.id ? null : curr))}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWireId((curr) => (curr === wire.id ? null : wire.id));
                      }}
                    >
                      <title>{`#${idx + 1}: ${getCompDisplayName(wire.fromInstanceId)} (${fromPinLabel}) → ${getCompDisplayName(wire.toInstanceId)} (${toPinLabel})`}</title>
                      <path d={d} fill="none" stroke="transparent" strokeWidth="16" />
                      {isActive && (
                        <path
                          d={d}
                          fill="none"
                          stroke="#FACC15"
                          strokeWidth="8"
                          strokeLinecap="round"
                          opacity="0.75"
                        />
                      )}
                      <path
                        d={d}
                        fill="none"
                        stroke={wire.color}
                        strokeWidth={isActive ? '4.5' : '3.2'}
                        strokeLinecap="round"
                        opacity={wireOpacity}
                      />
                      {isRunning && (
                        <path
                          d={d}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          className="animate-wire-flow"
                          opacity={hasAnyFocus ? (isActive ? 0.85 : 0.15) : 0.7}
                        />
                      )}
                    </g>
                  );
                })}

                {/* Placed Hardware Components */}
                {placedComponents.map((comp) => (
                  <CircuitComponentSvg
                    key={comp.instanceId}
                    placed={comp}
                    sim={simResult}
                    isRunning={isRunning}
                    selectedPin={selectedPin}
                    highlightedPinIds={highlightedPinsByInstance.get(comp.instanceId) || []}
                    hoveredPin={hoveredPin}
                    onPinClick={handlePinClick}
                    onPinHover={setHoveredPin}
                    onMouseDownBody={handleMouseDownBody}
                    onRemoveComponent={handleRemoveComponent}
                    motorRotationDeg={motorDeg}
                  />
                ))}

                {/* Wire Number & Pin-to-Pin Badges (always rendered above components) */}
                {wires.map((wire, idx) => {
                  const p1 = getPinAbsCoords(wire.fromInstanceId, wire.fromPinId);
                  const p2 = getPinAbsCoords(wire.toInstanceId, wire.toPinId);
                  if (!p1 || !p2) return null;

                  const laneOffset = (idx - (wires.length - 1) / 2) * 22;
                  const mx = (p1.x + p2.x) / 2;
                  const dy = p2.y - p1.y;
                  const curveSpread = Math.max(36, Math.abs(dy) * 0.45) + Math.abs(laneOffset) * 0.75;
                  const c1x = mx + laneOffset * 0.75;
                  const c1y = p1.y + (p1.y <= p2.y ? curveSpread : -curveSpread) * 0.55 + laneOffset * 0.45;
                  const c2x = mx - laneOffset * 0.75;
                  const c2y = p2.y - (p1.y <= p2.y ? curveSpread : -curveSpread) * 0.55 + laneOffset * 0.45;

                  const tBadge = 0.28 + (idx % 4) * 0.15;
                  const mt = 1 - tBadge;
                  const rawBx =
                    mt * mt * mt * p1.x +
                    3 * mt * mt * tBadge * c1x +
                    3 * mt * tBadge * tBadge * c2x +
                    tBadge * tBadge * tBadge * p2.x;
                  const rawBy =
                    mt * mt * mt * p1.y +
                    3 * mt * mt * tBadge * c1y +
                    3 * mt * tBadge * tBadge * c2y +
                    tBadge * tBadge * tBadge * p2.y;

                  const bx = Math.max(55, Math.min(825, rawBx));
                  const by = Math.max(18, Math.min(442, rawBy));

                  const hasAnyFocus = activeWireIds.size > 0;
                  const isActive = activeWireIds.has(wire.id);
                  const badgeOpacity = hasAnyFocus ? (isActive ? 1 : 0.25) : 0.96;
                  const fromPinLabel = getPinDisplayLabel(wire.fromInstanceId, wire.fromPinId);
                  const toPinLabel = getPinDisplayLabel(wire.toInstanceId, wire.toPinId);
                  const pinTagText = `#${idx + 1} ${fromPinLabel}→${toPinLabel}`;

                  return (
                    <g
                      key={`badge_${wire.id}`}
                      transform={`translate(${bx}, ${by})`}
                      opacity={badgeOpacity}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredWireId(wire.id)}
                      onMouseLeave={() => setHoveredWireId((curr) => (curr === wire.id ? null : curr))}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWireId((curr) => (curr === wire.id ? null : wire.id));
                      }}
                    >
                      {showWireLabels || isActive ? (
                        <g>
                          <rect
                            x={-(pinTagText.length * 3.6 + 9)}
                            y="-10"
                            width={pinTagText.length * 7.2 + 18}
                            height="20"
                            rx="10"
                            fill="#0F172A"
                            stroke={isActive ? '#FACC15' : wire.color}
                            strokeWidth="1.6"
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="9.5"
                            fontFamily="IBM Plex Mono, monospace"
                            fontWeight="700"
                          >
                            {pinTagText}
                          </text>
                        </g>
                      ) : (
                        <g>
                          <circle
                            cx="0"
                            cy="0"
                            r="9.5"
                            fill={wire.color}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                          />
                          <text
                            x="0"
                            y="3.5"
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="9.5"
                            fontFamily="IBM Plex Mono, monospace"
                            fontWeight="700"
                          >
                            {idx + 1}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Wire Connections Inspector Strip */}
            <div className="border-t border-slate-200/60 bg-white/45 px-4 py-3 backdrop-blur-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-semibold text-slate-900">
                  {isHi ? 'वायर कनेक्शन मैप (कहाँ से कहाँ जुड़ा है)' : 'Wire Connections Map'}
                </h3>
                {inspectedWire ? (
                  <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-950">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: inspectedWire.wire.color }}
                    />
                    <span className="font-mono">
                      #{inspectedWire.index + 1}{' '}
                      {getCompDisplayName(inspectedWire.wire.fromInstanceId)} (
                      {getPinDisplayLabel(inspectedWire.wire.fromInstanceId, inspectedWire.wire.fromPinId)}) →{' '}
                      {getCompDisplayName(inspectedWire.wire.toInstanceId)} (
                      {getPinDisplayLabel(inspectedWire.wire.toInstanceId, inspectedWire.wire.toPinId)})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWire(inspectedWire.wire.id)}
                      className="ml-1 rounded-full border border-rose-300/70 bg-rose-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-500/30 hover:border-rose-400 active:scale-95"
                    >
                      {isHi ? 'हटाएँ' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">
                    {isHi
                      ? 'किसी भी वायर या नीचे दी गई सूची पर क्लिक करें ताकि दोनों पिन चमकें'
                      : 'Hover or click any wire below (or on the board) to highlight both pins'}
                  </span>
                )}
              </div>

              {wires.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {isHi
                    ? 'अभी कोई वायर नहीं जुड़ा है। दो पिन पर क्लिक करके वायर जोड़ें।'
                    : 'No wires connected yet. Click any two pins on the board to add a wire.'}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {wires.map((wire, idx) => {
                    const isHighlighted = activeWireIds.has(wire.id);
                    const fromName = getCompDisplayName(wire.fromInstanceId);
                    const toName = getCompDisplayName(wire.toInstanceId);
                    const fromPin = getPinDisplayLabel(wire.fromInstanceId, wire.fromPinId);
                    const toPin = getPinDisplayLabel(wire.toInstanceId, wire.toPinId);

                    return (
                      <div
                        key={wire.id}
                        onMouseEnter={() => setHoveredWireId(wire.id)}
                        onMouseLeave={() => setHoveredWireId((curr) => (curr === wire.id ? null : curr))}
                        onClick={() => setSelectedWireId((curr) => (curr === wire.id ? null : wire.id))}
                        className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs cursor-pointer transition-colors ${
                          isHighlighted
                            ? 'border-amber-400 bg-amber-50/90 text-slate-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold text-white"
                            style={{ backgroundColor: wire.color }}
                          >
                            {idx + 1}
                          </span>
                          <span className="truncate">
                            <span className="font-medium text-slate-900">{fromName}</span>{' '}
                            <span className="font-mono font-semibold text-sky-700">[{fromPin}]</span>
                            <span className="mx-1 text-slate-400">→</span>
                            <span className="font-medium text-slate-900">{toName}</span>{' '}
                            <span className="font-mono font-semibold text-emerald-700">[{toPin}]</span>
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove wire ${idx + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveWire(wire.id);
                          }}
                          className="rounded-full border border-transparent bg-white/30 p-1 text-slate-500 backdrop-blur-sm transition-all duration-200 hover:border-rose-300 hover:bg-rose-500/20 hover:text-rose-700 hover:scale-110 active:scale-95 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sensor Environment Controls */}
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">{t.envControls}</h3>
              <span className="text-xs text-slate-500">
                {isRunning ? 'Simulation Active' : 'Paused'}
              </span>
            </div>

            {activePractical.requiredSensors.length === 0 && !showAllSensors ? (
              <p className="text-xs text-slate-600">
                {isHi
                  ? 'यह प्रैक्टिकल स्वचालित टाइमर पर चलता है। आप लाइव पिन मॉनिटर में वोल्टेज बदलते हुए देख सकते हैं।'
                  : 'This practical runs automatically on a timed microcontroller loop. Observe live voltage transitions in the Pin Monitor.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {hasSensor('distanceCm') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'बाधा की दूरी (Ultrasonic)' : 'Obstacle Distance'}</span>
                      <span className="font-mono tabular-nums text-sky-700">{env.distanceCm} cm</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={180}
                      value={env.distanceCm}
                      onChange={(e) => setEnv({ ...env, distanceCm: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </label>
                )}

                {hasSensor('lightPercent') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'सूरज की रोशनी (LDR)' : 'Ambient Light'}</span>
                      <span className="font-mono tabular-nums text-amber-700">{env.lightPercent} %</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={env.lightPercent}
                      onChange={(e) => setEnv({ ...env, lightPercent: Number(e.target.value) })}
                      className="w-full accent-amber-600"
                    />
                  </label>
                )}

                {hasSensor('temperatureC') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'तापमान (DHT11)' : 'Temperature'}</span>
                      <span className="font-mono tabular-nums text-rose-700">{env.temperatureC} °C</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={50}
                      value={env.temperatureC}
                      onChange={(e) => setEnv({ ...env, temperatureC: Number(e.target.value) })}
                      className="w-full accent-rose-600"
                    />
                  </label>
                )}

                {hasSensor('humidityPercent') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'हवा की नमी (Humidity)' : 'Humidity'}</span>
                      <span className="font-mono tabular-nums text-sky-700">{env.humidityPercent} %</span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={95}
                      value={env.humidityPercent}
                      onChange={(e) => setEnv({ ...env, humidityPercent: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </label>
                )}

                {hasSensor('moisturePercent') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'मिट्टी की नमी (Soil)' : 'Soil Moisture'}</span>
                      <span className="font-mono tabular-nums text-emerald-700">{env.moisturePercent} %</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={env.moisturePercent}
                      onChange={(e) => setEnv({ ...env, moisturePercent: Number(e.target.value) })}
                      className="w-full accent-emerald-600"
                    />
                  </label>
                )}

                {hasSensor('potentiometerPercent') && (
                  <label className="block space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-slate-700">
                      <span>{isHi ? 'नॉब घुमाव (Potentiometer)' : 'Potentiometer Knob'}</span>
                      <span className="font-mono tabular-nums text-sky-700">{env.potentiometerPercent} %</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={env.potentiometerPercent}
                      onChange={(e) => setEnv({ ...env, potentiometerPercent: Number(e.target.value) })}
                      className="w-full accent-sky-600"
                    />
                  </label>
                )}

                {hasSensor('buttonPressed') && (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span className="text-xs font-medium text-slate-700">
                      {isHi ? 'पुश बटन स्विच (D2)' : 'Push Button State (D2)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnv({ ...env, buttonPressed: !env.buttonPressed })}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        env.buttonPressed
                          ? 'border-emerald-400/75 bg-emerald-500/25 text-emerald-950 shadow-[0_4px_14px_rgba(5,150,105,0.2)]'
                          : 'border-white/80 bg-white/35 text-slate-800 hover:border-sky-300 hover:bg-white/65 hover:shadow-sm'
                      }`}
                    >
                      {env.buttonPressed ? 'PRESSED (HIGH)' : 'RELEASED (LOW)'}
                    </button>
                  </div>
                )}

                {hasSensor('irDetected') && (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <span className="text-xs font-medium text-slate-700">
                      {isHi ? 'IR सेंसर के पास हाथ' : 'IR Object / Hand Present'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnv({ ...env, irDetected: !env.irDetected })}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                        env.irDetected
                          ? 'border-sky-400/75 bg-sky-500/25 text-sky-950 shadow-[0_4px_14px_rgba(2,132,199,0.2)]'
                          : 'border-white/80 bg-white/35 text-slate-800 hover:border-sky-300 hover:bg-white/65 hover:shadow-sm'
                      }`}
                    >
                      {env.irDetected ? 'DETECTED' : 'CLEAR'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTROL & TELEMETRY DECK: 35% (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Guided Practical Selector */}
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <label htmlFor="practical-select" className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.selectPractical}
            </label>
            <select
              id="practical-select"
              value={selectedPracticalId}
              onChange={(e) => loadPractical(e.target.value)}
              className="w-full rounded-lg border border-slate-200/80 bg-white/75 px-3 py-2.5 text-sm font-medium text-slate-900 backdrop-blur-sm focus:border-sky-600 focus:outline-none"
            >
              {ROBOTICS_PRACTICALS.map((prac) => (
                <option key={prac.id} value={prac.id}>
                  {isHi ? prac.titleHi : prac.title}
                </option>
              ))}
              <option value="freeform">
                {isHi ? 'फ्रीफ़ॉर्म सैंडबॉक्स (खुद का सर्किट बनाएँ)' : 'Freeform Sandbox (Build Your Own)'}
              </option>
            </select>

            {selectedPracticalId === 'freeform' ? (
              <div className="mt-3 space-y-2.5">
                <p className="text-xs leading-relaxed text-slate-600">
                  {isHi
                    ? 'अपना खुद का रोबोटिक्स प्रोजेक्ट बनाएँ! ऊपर से कंपोनेंट जोड़ें और पिन से पिन वायर जोड़ें।'
                    : 'Build your own custom robotics circuit! Add parts from the top bar and wire pins together.'}
                </p>
                <div className="pt-1">
                  <h4 className="text-xs font-semibold text-slate-900 mb-1.5">{t.stepsTitle}</h4>
                  <ul className="space-y-1.5">
                    {(isHi
                      ? [
                          'ऊपर से एक कंपोनेंट (जैसे LED, Buzzer, Servo, या Sensor) चुनकर "+ Add Component" दबाएँ।',
                          'बोर्ड पर किसी भी पिन (जैसे 5V, GND, या D13) पर क्लिक करें, फिर दूसरे हिस्से की पिन पर क्लिक करके वायर जोड़ें।',
                          'नीचे "Wire Connections Map" में जाँचें कि कौन-सा वायर कहाँ जुड़ा है और "Run Practical" दबाएँ!',
                        ]
                      : [
                          'Choose an output or sensor from the top-left menu and click "+ Add Component".',
                          'Click a pin on Arduino (e.g., 5V, GND, or D13), then click a pin on your part to connect a wire.',
                          'Check the Wire Connections Map below the board to trace pins and click Run Practical!',
                        ]
                    ).map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{activePractical.level}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activePractical.duration}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {isHi ? activePractical.descriptionHi : activePractical.description}
                </p>
                <div className="pt-1">
                  <h4 className="text-xs font-semibold text-slate-900 mb-1.5">{t.stepsTitle}</h4>
                  <ul className="space-y-1.5">
                    {(isHi ? activePractical.stepsHi : activePractical.steps).map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Live Pin & Voltage Monitor */}
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-semibold text-slate-900">{t.pinMonitor}</h3>
              <Cpu className="h-3.5 w-3.5 text-sky-600" aria-hidden="true" />
            </div>
            <div className="divide-y divide-slate-200/60">
              {simResult.pinStates.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 text-xs">
                  <span className="font-mono font-medium text-slate-700">{row.pin}</span>
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className={row.active ? 'font-semibold text-emerald-700' : 'text-slate-500'}>
                      {row.state}
                    </span>
                    <span className="text-slate-500 w-11 text-right">{row.voltage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Serial Monitor & Arduino Code Toggle */}
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-slate-900">{t.serialOutput}</h3>
              {selectedPracticalId !== 'freeform' && (
                <button
                  type="button"
                  onClick={() => setShowCode((s) => !s)}
                  className="rounded-full border border-sky-300/75 bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-900 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-500/30 hover:border-sky-400 hover:shadow-sm active:scale-95"
                >
                  {showCode ? 'Hide Arduino C++' : 'View Arduino C++'}
                </button>
              )}
            </div>

            <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300">
              {simResult.serialLogs.map((log, i) => (
                <div key={i} className="truncate">{log}</div>
              ))}
            </div>

            {showCode && selectedPracticalId !== 'freeform' && (
              <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-800">
                {activePractical.arduinoCode}
              </pre>
            )}
          </div>
        </aside>
      </div>

      <BeginnerHintBox
        isHi={isHi}
        title={
          selectedPracticalId === 'freeform'
            ? isHi
              ? 'नए प्रोजेक्ट गाइड (सैंडबॉक्स)'
              : 'Beginner Project Guide (Sandbox)'
            : isHi
            ? `प्रैक्टिकल गाइड: ${activePractical.titleHi}`
            : `Beginner Guide: ${activePractical.title}`
        }
        liveHint={
          selectedPin
            ? isHi
              ? `आपने ${getCompDisplayName(selectedPin.instanceId)} (${getPinDisplayLabel(selectedPin.instanceId, selectedPin.pinId)}) चुना है — अब वायर जोड़ने के लिए दूसरे हिस्से की पिन पर क्लिक करें।`
              : `Pin selected on ${getCompDisplayName(selectedPin.instanceId)} (${getPinDisplayLabel(selectedPin.instanceId, selectedPin.pinId)}) — now click a target pin on another part to complete the wire.`
            : placedComponents.length <= 1
            ? isHi
              ? 'ऊपर से कोई LED, बज़र या सेंसर चुनकर "+ Add Component" दबाएँ।'
              : 'Pick an LED, Buzzer, Servo, or Sensor above and click "+ Add Component" to add your second part.'
            : wires.length === 0
            ? isHi
              ? 'कंट्रोलर की पिन (जैसे 5V, GND या D13) पर क्लिक करें और फिर सेंसर/LED की पिन पर क्लिक करके वायर जोड़ें।'
              : 'Click a pin on your controller (like 5V, GND, or D13), then click a pin on another part to connect a wire.'
            : !isRunning
            ? isHi
              ? 'सिमुलेशन रुका हुआ है — सर्किट चलाने के लिए ऊपर "प्रैक्टिकल चलाएँ" दबाएँ।'
              : 'Simulation is paused — click "Run Practical" at the top to power your circuit.'
            : selectedPracticalId === 'freeform'
            ? isHi
              ? 'आपका सर्किट चालू है! किसी भी वायर या वायर लिस्ट पर क्लिक करके दोनों पिन देख सकते हैं।'
              : 'Your custom circuit is live! Hover or click any wire (or Wire Connections Map row) to highlight both pins.'
            : isHi
            ? 'नीचे सेंसर स्लाइडर बदलकर लाइव आउटपुट देखें, या वायर पर क्लिक करके दोनों पिन की पहचान करें।'
            : 'Drag the sensor sliders below to test live responses, or click any wire to see both connected pins.'
        }
        steps={
          selectedPracticalId === 'freeform'
            ? isHi
              ? [
                  'ऊपर बाईं ओर से सेंसर, LED, मोटर या बज़र जोड़ें और बोर्ड पर खींचकर सजाएँ।',
                  'दो पिन पर एक-एक करके क्लिक करें (जैसे 5V→VCC, GND→GND, D13→+) ताकि वायर जुड़ जाए।',
                  'नीचे Wire Connections Map में वायर नंबर और पिन देखें, फिर "Run Practical" चलाएँ।',
                ]
              : [
                  'Add parts (LED, Buzzer, Servo, or Sensor) from the top-left menu and drag them cleanly on the board.',
                  'Click two pins in sequence (e.g., 5V → VCC, GND → GND, D13 → +) to connect jumper wires.',
                  'Check the Wire Connections Map below to verify every connection, then press Run Practical.',
                ]
            : isHi
            ? activePractical.stepsHi
            : activePractical.steps
        }
      />
    </section>
  );
};
