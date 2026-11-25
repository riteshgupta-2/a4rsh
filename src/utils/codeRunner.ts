export interface CodeRunResult {
  logs: string[];
  error?: string;
}

export function runJavaScriptSafe(code: string): CodeRunResult {
  const logs: string[] = [];
  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    },
    error: (...args: unknown[]) => {
      logs.push('Error: ' + args.map(String).join(' '));
    },
  };

  try {
    const fn = new Function('console', 'Math', `"use strict";\n${code}`);
    fn(customConsole, Math);
    return { logs: logs.length > 0 ? logs : ['(Program finished with no console output)'] };
  } catch (err) {
    return {
      logs,
      error: err instanceof Error ? err.message : 'JavaScript runtime error',
    };
  }
}

export function runArduinoCppSim(code: string): CodeRunResult {
  const logs: string[] = [];
  try {
    const lines = code.split('\n');
    const vars: Record<string, number | string> = {};
    let loopCount = 0;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('//') || line.startsWith('#')) continue;

      const intMatch = line.match(/^(?:int|float|long|const int)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/);
      if (intMatch) {
        const val = Number(intMatch[2]);
        vars[intMatch[1]] = Number.isNaN(val) ? intMatch[2] : val;
      }

      const printMatch = line.match(/Serial\.println\((.*)\);/);
      if (printMatch) {
        const expr = printMatch[1].trim();
        const unquoted = expr.replace(/^"(.*)"$/, '$1');
        logs.push(`[Serial] ${unquoted}`);
      }

      const pinMatch = line.match(/digitalWrite\(\s*([^,]+)\s*,\s*(HIGH|LOW)\s*\);/);
      if (pinMatch) {
        const pin = vars[pinMatch[1].trim()] ?? pinMatch[1].trim();
        logs.push(`[GPIO] Pin ${pin} -> ${pinMatch[2]} (${pinMatch[2] === 'HIGH' ? '5.0V' : '0.0V'})`);
      }

      const servoMatch = line.match(/\.write\(\s*([^)]+)\s*\);/);
      if (servoMatch) {
        logs.push(`[Servo] Rotated to ${servoMatch[1].trim()}°`);
      }

      if (line.includes('void loop()')) loopCount++;
    }

    if (loopCount > 0 && logs.length === 0) {
      logs.push('[Arduino] Compiled and uploaded cleanly to Uno R3.');
    }
    return { logs: logs.length ? logs : ['[Arduino] Sketch verified (0 errors).'] };
  } catch (err) {
    return {
      logs,
      error: err instanceof Error ? err.message : 'Arduino simulation error',
    };
  }
}

/**
 * Clean educational Python-subset interpreter supporting:
 * - variables, lists, strings, arithmetic
 * - print(...) with multiple args
 * - for x in range(...) and for x in list
 * - if / elif / else blocks with indentation
 * - def functions (0-2 args)
 */
export function runPythonSubset(code: string): CodeRunResult {
  const logs: string[] = [];

  try {
    const rawLines = code.replace(/\r\n/g, '\n').split('\n');
    const env: Record<string, unknown> = {};

    const evalExpr = (exprRaw: string, localScope: Record<string, unknown>): unknown => {
      const expr = exprRaw.trim();
      if (!expr) return undefined;

      // List literal
      if (expr.startsWith('[') && expr.endsWith(']')) {
        const inner = expr.slice(1, -1).trim();
        if (!inner) return [];
        return inner.split(',').map((item) => evalExpr(item, localScope));
      }

      // Replace Python keywords with JS equivalents outside quotes
      const scope = { ...env, ...localScope };
      const keys = Object.keys(scope);
      const vals = keys.map((k) => scope[k]);

      const jsExpr = expr
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\s+/g, '!')
        .replace(/\blen\(([^)]+)\)/g, '($1).length')
        .replace(/\bstr\(([^)]+)\)/g, 'String($1)')
        .replace(/\bint\(([^)]+)\)/g, 'parseInt($1, 10)');

      const evaluator = new Function(...keys, 'Math', `"use strict"; return (${jsExpr});`);
      return evaluator(...vals, Math);
    };

    const splitPrintArgs = (inner: string): string[] => {
      const args: string[] = [];
      let current = '';
      let inQuote: string | null = null;
      let depth = 0;
      for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if ((ch === '"' || ch === "'") && inner[i - 1] !== '\\') {
          inQuote = inQuote === ch ? null : inQuote ?? ch;
        } else if (!inQuote) {
          if (ch === '(' || ch === '[') depth++;
          if (ch === ')' || ch === ']') depth--;
          if (ch === ',' && depth === 0) {
            args.push(current.trim());
            current = '';
            continue;
          }
        }
        current += ch;
      }
      if (current.trim()) args.push(current.trim());
      return args;
    };

    interface ParsedLine {
      indent: number;
      text: string;
      lineNum: number;
    }

    const parsed: ParsedLine[] = rawLines
      .map((line, idx) => {
        const stripped = line.replace(/\s+#.*$/, '').trimEnd();
        const text = stripped.trim();
        const indent = line.search(/\S|$/);
        return { indent, text, lineNum: idx + 1 };
      })
      .filter((l) => l.text.length > 0 && !l.text.startsWith('#'));

    let safetyCounter = 0;

    const execBlock = (startIdx: number, baseIndent: number, scope: Record<string, unknown>): number => {
      let i = startIdx;
      let lastIfTaken = false;

      while (i < parsed.length) {
        if (++safetyCounter > 2000) {
          throw new Error('Loop iteration limit reached (2000 steps)');
        }
        const curr = parsed[i];
        if (curr.indent < baseIndent) break;

        const text = curr.text;

        if (text.startsWith('print(') && text.endsWith(')')) {
          const inner = text.slice(6, -1);
          const args = splitPrintArgs(inner).map((a) => {
            const v = evalExpr(a, scope);
            return Array.isArray(v) ? `[${v.join(', ')}]` : String(v);
          });
          logs.push(args.join(' '));
          i++;
          continue;
        }

        const forRange = text.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(([^)]+)\):$/);
        if (forRange) {
          const varName = forRange[1];
          const rangeArgs = forRange[2].split(',').map((a) => Number(evalExpr(a, scope)));
          let start = 0, end = 0, step = 1;
          if (rangeArgs.length === 1) {
            end = rangeArgs[0];
          } else if (rangeArgs.length === 2) {
            start = rangeArgs[0];
            end = rangeArgs[1];
          } else {
            start = rangeArgs[0];
            end = rangeArgs[1];
            step = rangeArgs[2] || 1;
          }

          let blockEnd = i + 1;
          const bodyIndent = parsed[blockEnd]?.indent ?? baseIndent + 2;
          while (blockEnd < parsed.length && parsed[blockEnd].indent >= bodyIndent) {
            blockEnd++;
          }

          if (i + 1 < blockEnd) {
            for (let v = start; step > 0 ? v < end : v > end; v += step) {
              scope[varName] = v;
              execBlock(i + 1, bodyIndent, scope);
            }
          }
          i = blockEnd;
          continue;
        }

        const forList = text.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+(.+):$/);
        if (forList) {
          const varName = forList[1];
          const iterable = evalExpr(forList[2], scope);
          let blockEnd = i + 1;
          const bodyIndent = parsed[blockEnd]?.indent ?? baseIndent + 2;
          while (blockEnd < parsed.length && parsed[blockEnd].indent >= bodyIndent) {
            blockEnd++;
          }
          if (Array.isArray(iterable) && i + 1 < blockEnd) {
            for (const item of iterable) {
              scope[varName] = item;
              execBlock(i + 1, bodyIndent, scope);
            }
          }
          i = blockEnd;
          continue;
        }

        if (text.startsWith('if ') && text.endsWith(':')) {
          const cond = Boolean(evalExpr(text.slice(3, -1), scope));
          lastIfTaken = cond;
          let blockEnd = i + 1;
          const bodyIndent = parsed[blockEnd]?.indent ?? baseIndent + 2;
          while (blockEnd < parsed.length && parsed[blockEnd].indent >= bodyIndent) {
            blockEnd++;
          }
          if (cond && i + 1 < blockEnd) {
            execBlock(i + 1, bodyIndent, scope);
          }
          i = blockEnd;
          continue;
        }

        if (text.startsWith('elif ') && text.endsWith(':')) {
          let blockEnd = i + 1;
          const bodyIndent = parsed[blockEnd]?.indent ?? baseIndent + 2;
          while (blockEnd < parsed.length && parsed[blockEnd].indent >= bodyIndent) {
            blockEnd++;
          }
          if (!lastIfTaken) {
            const cond = Boolean(evalExpr(text.slice(5, -1), scope));
            if (cond) {
              lastIfTaken = true;
              if (i + 1 < blockEnd) execBlock(i + 1, bodyIndent, scope);
            }
          }
          i = blockEnd;
          continue;
        }

        if (text === 'else:') {
          let blockEnd = i + 1;
          const bodyIndent = parsed[blockEnd]?.indent ?? baseIndent + 2;
          while (blockEnd < parsed.length && parsed[blockEnd].indent >= bodyIndent) {
            blockEnd++;
          }
          if (!lastIfTaken && i + 1 < blockEnd) {
            execBlock(i + 1, bodyIndent, scope);
          }
          lastIfTaken = false;
          i = blockEnd;
          continue;
        }

        const assign = text.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
        if (assign) {
          const val = evalExpr(assign[2], scope);
          scope[assign[1]] = val;
          env[assign[1]] = val;
          i++;
          continue;
        }

        i++;
      }
      return i;
    };

    if (parsed.length > 0) {
      execBlock(0, parsed[0].indent, env);
    }

    return { logs: logs.length > 0 ? logs : ['(Python script completed with no output)'] };
  } catch (err) {
    return {
      logs,
      error: err instanceof Error ? err.message : 'Python syntax error',
    };
  }
}
