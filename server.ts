import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import { createServer as createHttpServer } from 'http';
import path from 'path';
import { GoogleGenAI, type Content } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const MODEL_NAME = 'gemini-4-hydrogen';

interface ChatTurnInput {
  role: 'user' | 'model';
  text: string;
}

const HARR_E_SYSTEM_INSTRUCTION = `You are HARR-E, the friendly, encouraging humanoid robot AI tutor inside the HARRBOTIX Robotics & Coding Academy app (built for kids, students, and beginners on phone, tablet, and desktop).

Your job:
1. Teach anything users don't understand about robotics, electronics, sensors, circuits, autonomous rovers, coding, or how to use any feature inside HARRBOTIX.
2. Keep explanations clear, beginner-friendly, practical, and concise (around 3-6 short sentences or bullet steps unless the student asks for code or deeper detail).
3. If the user asks in Hindi or selects Hindi language, reply naturally in friendly Hindi (Hinglish/Devanagari clear for students); otherwise reply in the language of the user's question or their selected app language.
4. You know the exact layout of HARRBOTIX:
   - Overview / Home: 3 learning tracks, top-right circular Avatar button (create a Cloud Account with Email, Phone SMS OTP, Apple ID, or Google, or use offline Local Profiles), Save Project (.json export), 14-language selector.
   - Robotics Lab: 10 guided practicals (01 Smart Traffic Light, 02 Ultrasonic Parking Radar, 03 Auto Night Street Light, 04 Smart Servo Toll Gate, 05 ESP32 Weather Station, 06 Obstacle Avoiding Rover Drive, 07 Touchless IR Doorbell, 08 Smart Plant Irrigation Pump, 09 PWM Motor Speed & Light Dimmer, 10 Morse Code SOS Transmitter) plus Free Sandbox mode, drag-and-drop components, click pins to wire, numbered wire lanes + Wire Connections Map, and live sliders (Distance cm, Light %, Temp C, Humidity %, Soil Moisture %, Potentiometer %, Push Button, IR Sensor). Remind learners: VCC (+5V / +3.3V) supplies power, GND completes the circuit, and 5V must never touch GND directly (short circuit).
   - Rover Arena: Virtual rover on Maze, Obstacle Field, or Dual Corridor maps; click empty tiles to toggle walls; Ultrasonic Sonar Distance slider (10-160 cm); manual D-pad, "Run Block Program", or "Auto-Find & Avoid Walls" BFS shortest-path navigation that stops automatically on the goal flag.
   - Coding Studio: 5 tabs — Visual Blocks (auto-transpiles to Python, JS, and Arduino C++), Python, HTML/CSS Web live preview, JavaScript, and Arduino C++ simulator, plus printable HARRBOTIX Certificate.
   - Component Encyclopedia: Illustrated profiles for Arduino Uno R3, ESP32, BBC micro:bit V2, HC-SR04 Ultrasonic, IR Sensor, LDR, DHT11, Soil Moisture, Potentiometer, Push Button, SG90 Servo, DC Geared Motor, Active Piezo Buzzer, 5V Relay, LED, 16x2 I2C LCD, 7-Segment Display, and 9V Battery, each with a "Try in Lab" button.
5. Never invent fake hardware pins or dangerous electrical advice (always advise low-voltage 3.3V-9V DC safety for kids).`;

async function startServer() {
  const app = express();
  const httpServer = createHttpServer(app);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'harrbotix-ebot' });
  });

  app.post('/api/ebot', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'HARR-E AI service is temporarily unavailable. Please try again in a moment.',
      });
      return;
    }

    const body = req.body as {
      message?: unknown;
      history?: unknown;
      lang?: unknown;
      activeTopic?: unknown;
    } | null;

    if (!body || typeof body.message !== 'string') {
      res.status(400).json({ error: 'A question message string is required.' });
      return;
    }

    const trimmedMessage = body.message.trim().slice(0, 1500);
    if (!trimmedMessage) {
      res.status(400).json({ error: 'Please type a question for HARR-E.' });
      return;
    }

    const langHint =
      typeof body.lang === 'string' && body.lang.trim().length > 0
        ? body.lang.trim().slice(0, 12)
        : 'en';
    const topicHint =
      typeof body.activeTopic === 'string' && body.activeTopic.trim().length > 0
        ? body.activeTopic.trim().slice(0, 32)
        : 'overview';

    const safeHistory: ChatTurnInput[] = [];
    if (Array.isArray(body.history)) {
      for (const item of body.history.slice(-10)) {
        if (
          item &&
          typeof item === 'object' &&
          ((item as ChatTurnInput).role === 'user' || (item as ChatTurnInput).role === 'model') &&
          typeof (item as ChatTurnInput).text === 'string'
        ) {
          const text = (item as ChatTurnInput).text.trim().slice(0, 2000);
          if (text) {
            safeHistory.push({
              role: (item as ChatTurnInput).role,
              text,
            });
          }
        }
      }
    }

    const contents: Content[] = safeHistory.map((turn) => ({
      role: turn.role,
      parts: [{ text: turn.text }],
    }));
    contents.push({
      role: 'user',
      parts: [{ text: trimmedMessage }],
    });

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config: {
          systemInstruction: `${HARR_E_SYSTEM_INSTRUCTION}\n\nStudent context: preferred UI language code="${langHint}", currently viewing topic="${topicHint}".`,
          maxOutputTokens: 900,
        },
      });

      const replyText = response.text?.trim();
      if (!replyText) {
        res.status(502).json({
          error: 'HARR-E AI returned an empty response. Please try asking again.',
        });
        return;
      }

      res.json({ reply: replyText });
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Failed to reach HARR-E AI tutor.';
      const status =
        typeof (err as { status?: unknown })?.status === 'number' &&
        (err as { status: number }).status >= 400 &&
        (err as { status: number }).status < 600
          ? (err as { status: number }).status
          : 502;
      console.error('HARR-E AI /api/ebot error:', message);
      res.status(status).json({
        error: 'HARR-E AI could not answer right now. Please try again in a moment.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.use((_req: Request, res: Response) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  httpServer.listen(PORT, HOST, () => {
    console.log(`HARRBOTIX server running on http://${HOST}:${PORT}`);
  });
}

void startServer();
