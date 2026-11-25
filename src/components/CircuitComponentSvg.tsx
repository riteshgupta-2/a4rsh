import React from 'react';
import {
  PlacedComponent,
  PracticalSimulationResult,
  ROBOTICS_COMPONENTS,
} from '../data/roboticsData';

interface CircuitComponentSvgProps {
  placed: PlacedComponent;
  sim: PracticalSimulationResult | null;
  isRunning: boolean;
  selectedPin: { instanceId: string; pinId: string } | null;
  highlightedPinIds?: string[];
  hoveredPin?: { instanceId: string; pinId: string } | null;
  onPinClick: (instanceId: string, pinId: string) => void;
  onPinHover?: (pin: { instanceId: string; pinId: string } | null) => void;
  onMouseDownBody: (e: React.MouseEvent, instanceId: string) => void;
  onRemoveComponent?: (instanceId: string) => void;
  motorRotationDeg: number;
}

export const CircuitComponentSvg: React.FC<CircuitComponentSvgProps> = ({
  placed,
  sim,
  isRunning,
  selectedPin,
  highlightedPinIds = [],
  hoveredPin = null,
  onPinClick,
  onPinHover,
  onMouseDownBody,
  onRemoveComponent,
  motorRotationDeg,
}) => {
  const def = ROBOTICS_COMPONENTS.find((c) => c.id === placed.defId);
  if (!def) return null;

  const renderHardwareBody = () => {
    switch (def.id) {
      case 'arduino_uno':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="8" fill="#0369A1" stroke="#0C4A6E" strokeWidth="2" />
            <rect x="-8" y="28" width="24" height="28" rx="3" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
            <rect x="4" y="88" width="20" height="22" rx="3" fill="#1E293B" />
            <rect x="58" y="54" width="84" height="32" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
            <text x="100" y="74" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
              ATmega328P
            </text>
            <text x="105" y="42" textAnchor="middle" fill="#E0F2FE" fontSize="11" fontWeight="700">
              ARDUINO UNO
            </text>
            <circle cx="164" cy="40" r="4" fill={isRunning ? '#22C55E' : '#94A3B8'} />
            <text x="154" y="43" textAnchor="end" fill="#BAE6FD" fontSize="8">ON</text>
          </g>
        );

      case 'esp32':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <rect x="26" y="24" width="122" height="58" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
            <text x="87" y="50" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700">
              ESP32 WiFi
            </text>
            <text x="87" y="66" textAnchor="middle" fill="#1E293B" fontSize="9" fontFamily="IBM Plex Mono, monospace">
              BLE · Dual Core
            </text>
            <rect x="74" y="90" width="28" height="12" rx="2" fill="#CBD5E1" />
            <circle cx="152" cy="94" r="4" fill={isRunning ? '#38BDF8' : '#64748B'} />
          </g>
        );

      case 'microbit': {
        const activeDots = isRunning ? [1, 3, 6, 8, 12, 16, 18, 20, 22, 24] : [12];
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="10" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <rect x="46" y="20" width="62" height="62" rx="4" fill="#1E293B" />
            {Array.from({ length: 25 }).map((_, idx) => {
              const row = Math.floor(idx / 5);
              const col = idx % 5;
              const lit = activeDots.includes(idx);
              return (
                <rect
                  key={idx}
                  x={52 + col * 11}
                  y={26 + row * 11}
                  width="6"
                  height="6"
                  rx="1"
                  fill={lit ? '#EF4444' : '#475569'}
                />
              );
            })}
            <circle cx="24" cy="52" r="10" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
            <text x="24" y="55" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">A</text>
            <circle cx="131" cy="52" r="10" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
            <text x="131" y="55" textAnchor="middle" fill="#FFF" fontSize="8" fontWeight="700">B</text>
            <text x="77" y="96" textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="700">micro:bit</text>
          </g>
        );
      }

      case 'ultrasonic':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="7" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <circle cx="38" cy="34" r="22" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
            <circle cx="38" cy="34" r="13" fill="#0F172A" />
            <circle cx="102" cy="34" r="22" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
            <circle cx="102" cy="34" r="13" fill="#0F172A" />
            <text x="70" y="13" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="700">HC-SR04</text>
            {isRunning && (
              <path d="M 55 8 Q 70 0 85 8" fill="none" stroke="#BAE6FD" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>
        );

      case 'ir_sensor':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#0F766E" stroke="#115E59" strokeWidth="2" />
            <circle cx="42" cy="24" r="8" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
            <circle cx="78" cy="24" r="8" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
            <text x="60" y="45" textAnchor="middle" fill="#CCFBF1" fontSize="9" fontWeight="700">IR SENSOR</text>
          </g>
        );

      case 'ldr_sensor':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="2" />
            <circle cx="55" cy="25" r="13" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            <path d="M 46 25 Q 55 18 64 25 Q 55 32 46 25" fill="none" stroke="#B45309" strokeWidth="1.5" />
            <text x="55" y="49" textAnchor="middle" fill="#DBEAFE" fontSize="8.5" fontWeight="700">LDR LIGHT</text>
          </g>
        );

      case 'dht11':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#0EA5E9" stroke="#0284C7" strokeWidth="2" />
            <rect x="16" y="10" width="80" height="44" rx="3" fill="#38BDF8" stroke="#E0F2FE" strokeWidth="1" />
            <line x1="28" y1="20" x2="84" y2="20" stroke="#0369A1" strokeWidth="2" />
            <line x1="28" y1="30" x2="84" y2="30" stroke="#0369A1" strokeWidth="2" />
            <line x1="28" y1="40" x2="84" y2="40" stroke="#0369A1" strokeWidth="2" />
            <text x="56" y="64" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="700">DHT11</text>
          </g>
        );

      case 'soil_sensor':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#92400E" stroke="#78350F" strokeWidth="2" />
            <rect x="30" y="10" width="12" height="44" rx="4" fill="#FDE68A" />
            <rect x="68" y="10" width="12" height="44" rx="4" fill="#FDE68A" />
            <text x="55" y="67" textAnchor="middle" fill="#FEF3C7" fontSize="8.5" fontWeight="700">SOIL PROBE</text>
          </g>
        );

      case 'potentiometer': {
        const angle = sim ? (sim.servoAngle - 90) * 1.2 : 0;
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#334155" stroke="#1E293B" strokeWidth="2" />
            <circle cx="48" cy="34" r="21" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
            <g transform={`translate(48,34) rotate(${angle})`}>
              <circle cx="0" cy="0" r="14" fill="#0284C7" />
              <line x1="0" y1="0" x2="0" y2="-13" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            </g>
            <text x="48" y="64" textAnchor="middle" fill="#F1F5F9" fontSize="8" fontWeight="700">KNOB</text>
          </g>
        );
      }

      case 'push_button':
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#475569" stroke="#1E293B" strokeWidth="2" />
            <circle cx="42" cy="28" r="16" fill="#DC2626" stroke="#991B1B" strokeWidth="2" />
            <text x="42" y="53" textAnchor="middle" fill="#F8FAFC" fontSize="8" fontWeight="700">BUTTON</text>
          </g>
        );

      case 'servo_motor': {
        const angle = isRunning && sim ? sim.servoAngle : 0;
        return (
          <g>
            <rect x="10" y="22" width="100" height="54" rx="5" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <rect x="2" y="34" width="116" height="10" rx="2" fill="#0369A1" />
            <text x="60" y="64" textAnchor="middle" fill="#E0F2FE" fontSize="9" fontWeight="700">
              SERVO {angle}°
            </text>
            <g transform={`translate(60, 26) rotate(${angle - 90})`}>
              <rect x="-6" y="-22" width="12" height="28" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="5" fill="#0F172A" />
            </g>
          </g>
        );
      }

      case 'dc_motor': {
        const rpm = isRunning && sim ? sim.motorRpm : 0;
        return (
          <g>
            <rect x="8" y="18" width="68" height="48" rx="6" fill="#F59E0B" stroke="#B45309" strokeWidth="2" />
            <text x="42" y="42" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700">
              DC MOTOR
            </text>
            <text x="42" y="54" textAnchor="middle" fill="#451A03" fontSize="8" fontFamily="IBM Plex Mono, monospace">
              {rpm} RPM
            </text>
            <g transform={`translate(98, 42) rotate(${rpm > 0 ? motorRotationDeg : 0})`}>
              <circle cx="0" cy="0" r="22" fill="#1E293B" stroke="#475569" strokeWidth="2" />
              <line x1="-18" y1="0" x2="18" y2="0" stroke="#F59E0B" strokeWidth="3" />
              <line x1="0" y1="-18" x2="0" y2="18" stroke="#F59E0B" strokeWidth="3" />
              <circle cx="0" cy="0" r="5" fill="#E2E8F0" />
            </g>
          </g>
        );
      }

      case 'buzzer': {
        const active = isRunning && sim && sim.buzzerFreq > 0;
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
            <circle cx="45" cy="30" r="20" fill="#0F172A" stroke="#475569" strokeWidth="2" />
            <circle cx="45" cy="30" r="6" fill={active ? '#F59E0B' : '#64748B'} />
            {active && (
              <>
                <circle cx="45" cy="30" r="26" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="45" y="10" textAnchor="middle" fill="#FDE68A" fontSize="8" fontWeight="700">BEEP!</text>
              </>
            )}
            <text x="45" y="58" textAnchor="middle" fill="#E2E8F0" fontSize="8" fontWeight="700">BUZZER</text>
          </g>
        );
      }

      case 'relay': {
        const closed = isRunning && sim?.relayClosed;
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#0284C7" stroke="#0369A1" strokeWidth="2" />
            <rect x="14" y="10" width="90" height="36" rx="4" fill="#0369A1" />
            <text x="59" y="27" textAnchor="middle" fill="#FFF" fontSize="9" fontWeight="700">5V RELAY</text>
            <text x="59" y="40" textAnchor="middle" fill={closed ? '#86EFAC' : '#BAE6FD'} fontSize="8" fontFamily="IBM Plex Mono, monospace">
              {closed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
            </text>
          </g>
        );
      }

      case 'led_bulb': {
        const isLit = isRunning && sim ? Boolean(sim.ledStates[placed.instanceId]) : false;
        const variant = placed.colorVariant ?? 'red';
        const palette = {
          red: { off: '#FCA5A5', on: '#EF4444', glow: 'rgba(239,68,68,0.45)' },
          amber: { off: '#FDE68A', on: '#F59E0B', glow: 'rgba(245,158,11,0.45)' },
          emerald: { off: '#86EFAC', on: '#10B981', glow: 'rgba(16,185,129,0.45)' },
          sky: { off: '#BAE6FD', on: '#0EA5E9', glow: 'rgba(14,165,233,0.45)' },
        }[variant];

        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            {isLit && <circle cx="37" cy="28" r="24" fill={palette.glow} />}
            <circle cx="37" cy="28" r="14" fill={isLit ? palette.on : palette.off} stroke="#334155" strokeWidth="1.5" />
            <text x="37" y="54" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="700">
              {placed.label || 'LED'} {isLit ? 'ON' : 'OFF'}
            </text>
          </g>
        );
      }

      case 'lcd_16x2': {
        const l1 = isRunning && sim?.lcdLine1 ? sim.lcdLine1 : 'HARRBOTIX';
        const l2 = isRunning && sim?.lcdLine2 ? sim.lcdLine2 : 'READY TO RUN';
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#15803D" stroke="#166534" strokeWidth="2" />
            <rect x="12" y="12" width="144" height="46" rx="3" fill={isRunning ? '#84CC16' : '#65A30D'} stroke="#0F172A" strokeWidth="1.5" />
            <text x="20" y="30" fill="#0F172A" fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
              {l1.slice(0, 16)}
            </text>
            <text x="20" y="48" fill="#0F172A" fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
              {l2.slice(0, 16)}
            </text>
          </g>
        );
      }

      case 'seven_seg': {
        const ch = isRunning && sim ? sim.sevenSegChar : '0';
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="6" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <rect x="14" y="10" width="56" height="48" rx="3" fill="#1E293B" />
            <text x="42" y="46" textAnchor="middle" fill={isRunning ? '#EF4444' : '#475569'} fontSize="32" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
              {ch}
            </text>
          </g>
        );
      }

      case 'battery_9v':
      default:
        return (
          <g>
            <rect x="0" y="0" width={def.width} height={def.height} rx="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <rect x="0" y="0" width={def.width} height="22" rx="6" fill="#D97706" />
            <text x="50" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="700">9V POWER</text>
            <text x="50" y="44" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontWeight="700">BATTERY</text>
          </g>
        );
    }
  };

  return (
    <g
      transform={`translate(${placed.x}, ${placed.y})`}
      className="cursor-grab active:cursor-grabbing select-none"
      onMouseDown={(e) => onMouseDownBody(e, placed.instanceId)}
    >
      {renderHardwareBody()}

      {onRemoveComponent && (
        <g
          transform={`translate(${def.width - 8}, -8)`}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemoveComponent(placed.instanceId);
          }}
        >
          <circle cx="0" cy="0" r="9" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
          <path d="M -3 -3 L 3 3 M 3 -3 L -3 3" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {def.pins.map((pin) => {
        const isSelected =
          selectedPin?.instanceId === placed.instanceId && selectedPin?.pinId === pin.id;
        const isHovered =
          hoveredPin?.instanceId === placed.instanceId && hoveredPin?.pinId === pin.id;
        const isWireHighlighted = highlightedPinIds.includes(pin.id);
        const pinColor =
          pin.type === 'power'
            ? '#DC2626'
            : pin.type === 'ground'
            ? '#0F172A'
            : pin.type === 'pwm'
            ? '#D97706'
            : pin.type === 'analog'
            ? '#059669'
            : '#0284C7';

        return (
          <g
            key={pin.id}
            transform={`translate(${pin.rx}, ${pin.ry})`}
            className="cursor-pointer"
            onMouseEnter={() => onPinHover?.({ instanceId: placed.instanceId, pinId: pin.id })}
            onMouseLeave={() => onPinHover?.(null)}
            onClick={(e) => {
              e.stopPropagation();
              onPinClick(placed.instanceId, pin.id);
            }}
          >
            <title>{`${placed.label ? `${placed.label} ` : ''}${def.name} · ${pin.label} (${pin.type})`}</title>
            {(isWireHighlighted || isHovered || isSelected) && (
              <circle
                cx="0"
                cy="0"
                r={isSelected ? 11 : 10}
                fill="none"
                stroke="#FACC15"
                strokeWidth="3"
              />
            )}
            <circle
              cx="0"
              cy="0"
              r={isSelected || isWireHighlighted || isHovered ? 7.5 : 6}
              fill={isSelected ? '#FACC15' : pinColor}
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <text
              x="0"
              y={pin.ry < def.height / 2 ? 15 : -10}
              textAnchor="middle"
              fill={isWireHighlighted || isHovered ? '#FEF08A' : '#FFFFFF'}
              stroke="#0F172A"
              strokeWidth="2.5"
              paintOrder="stroke"
              fontSize={isWireHighlighted || isHovered ? '9' : '8'}
              fontFamily="IBM Plex Mono, monospace"
              fontWeight="700"
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </g>
  );
};
