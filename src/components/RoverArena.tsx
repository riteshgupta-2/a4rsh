import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Compass,
  Flag,
  Play,
  RotateCcw,
  Sparkles,
  Square,
} from 'lucide-react';
import { CodeBlock } from '../data/codingData';
import { LanguageCode, TranslationStrings } from '../i18n/translations';
import { BeginnerHintBox } from './BeginnerHintBox';

interface RoverArenaProps {
  lang: LanguageCode;
  t: TranslationStrings;
  blocks: CodeBlock[];
  onGoalReached: () => void;
}

type Direction = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

interface ArenaMap {
  id: string;
  name: string;
  nameHi: string;
  start: { x: number; y: number; dir: Direction };
  goal: { x: number; y: number };
  walls: string[];
  lineCells: string[];
}

const ARENA_MAPS: ArenaMap[] = [
  {
    id: 'obstacle_course',
    name: '01. Obstacle Avoidance Course',
    nameHi: '01. बाधाओं से बचने वाला ट्रैक',
    start: { x: 1, y: 6, dir: 1 },
    goal: { x: 8, y: 1 },
    walls: ['3,6', '3,5', '3,4', '6,1', '6,2', '6,3', '5,5', '7,5'],
    lineCells: [],
  },
  {
    id: 'maze_runner',
    name: '02. Smart Maze Navigator',
    nameHi: '02. स्मार्ट भूलभुलैया (मेज़) ट्रैक',
    start: { x: 0, y: 7, dir: 0 },
    goal: { x: 9, y: 0 },
    walls: ['1,7', '1,6', '1,5', '3,2', '3,3', '3,4', '3,5', '5,6', '5,5', '5,4', '7,1', '7,2', '7,3', '7,4', '8,4'],
    lineCells: [],
  },
  {
    id: 'line_follower',
    name: '03. Black Line Follower Track',
    nameHi: '03. काली लाइन फॉलो करने वाला ट्रैक',
    start: { x: 1, y: 6, dir: 1 },
    goal: { x: 8, y: 2 },
    walls: ['4,4'],
    lineCells: ['1,6', '2,6', '3,6', '4,6', '5,6', '5,5', '5,4', '5,3', '5,2', '6,2', '7,2', '8,2'],
  },
];

const GRID_COLS = 10;
const GRID_ROWS = 8;

const DELTAS = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

export const RoverArena: React.FC<RoverArenaProps> = ({ lang, t, blocks, onGoalReached }) => {
  const [mapId, setMapId] = useState<string>(ARENA_MAPS[0].id);
  const [walls, setWalls] = useState<Set<string>>(() => new Set(ARENA_MAPS[0].walls));
  const [rover, setRover] = useState(ARENA_MAPS[0].start);
  const [speedPct, setSpeedPct] = useState<number>(75);
  const [sonarRangeCm, setSonarRangeCm] = useState<number>(60);
  const [continueAfterBlocks, setContinueAfterBlocks] = useState<boolean>(true);
  const [logs, setLogs] = useState<string[]>(['Rover ready at start dock.']);
  const [isExecutingBlocks, setIsExecutingBlocks] = useState<boolean>(false);
  const [isAutoNavigating, setIsAutoNavigating] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  const currentMap = ARENA_MAPS.find((m) => m.id === mapId) || ARENA_MAPS[0];
  const isHi = lang === 'hi';

  const blockTimerRef = useRef<number | null>(null);
  const visitedRef = useRef<Map<string, number>>(new Map());
  const wallsRef = useRef<Set<string>>(walls);
  const sonarRangeRef = useRef<number>(sonarRangeCm);
  const speedPctRef = useRef<number>(speedPct);
  const continueAfterBlocksRef = useRef<boolean>(continueAfterBlocks);

  useEffect(() => {
    wallsRef.current = walls;
  }, [walls]);

  useEffect(() => {
    sonarRangeRef.current = sonarRangeCm;
  }, [sonarRangeCm]);

  useEffect(() => {
    speedPctRef.current = speedPct;
  }, [speedPct]);

  useEffect(() => {
    continueAfterBlocksRef.current = continueAfterBlocks;
  }, [continueAfterBlocks]);

  const clearBlockTimer = () => {
    if (blockTimerRef.current !== null) {
      window.clearTimeout(blockTimerRef.current);
      window.clearInterval(blockTimerRef.current);
      blockTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearBlockTimer();
  }, []);

  const loadMap = (id: string) => {
    clearBlockTimer();
    const m = ARENA_MAPS.find((item) => item.id === id) || ARENA_MAPS[0];
    setMapId(m.id);
    const nextWalls = new Set(m.walls);
    setWalls(nextWalls);
    wallsRef.current = nextWalls;
    setRover({ ...m.start });
    visitedRef.current = new Map();
    setWon(false);
    setIsExecutingBlocks(false);
    setIsAutoNavigating(false);
    setLogs([`Loaded ${m.name}`]);
  };

  const resetRover = () => {
    clearBlockTimer();
    setRover({ ...currentMap.start });
    visitedRef.current = new Map();
    setWon(false);
    setIsExecutingBlocks(false);
    setIsAutoNavigating(false);
    setLogs(['Rover returned to start position.']);
  };

  const isCellOpen = (x: number, y: number, wallSet: Set<string> = wallsRef.current) =>
    x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS && !wallSet.has(`${x},${y}`);

  const pickSmartOpenDirection = (
    x: number,
    y: number,
    currentDir: Direction,
    wallSet: Set<string> = wallsRef.current,
    visited?: Map<string, number>
  ): Direction | null => {
    const candidates: Direction[] = [
      ((currentDir + 1) % 4) as Direction,
      ((currentDir + 3) % 4) as Direction,
      ((currentDir + 2) % 4) as Direction,
    ];
    const openDirs = candidates.filter((dir) => {
      const d = DELTAS[dir];
      return isCellOpen(x + d.dx, y + d.dy, wallSet);
    });

    if (openDirs.length === 0) return null;

    openDirs.sort((a, b) => {
      const da = DELTAS[a];
      const db = DELTAS[b];
      const ax = x + da.dx;
      const ay = y + da.dy;
      const bx = x + db.dx;
      const by = y + db.dy;

      const va = visited?.get(`${ax},${ay}`) ?? 0;
      const vb = visited?.get(`${bx},${by}`) ?? 0;
      if (va !== vb) return va - vb;

      const distA = Math.abs(currentMap.goal.x - ax) + Math.abs(currentMap.goal.y - ay);
      const distB = Math.abs(currentMap.goal.x - bx) + Math.abs(currentMap.goal.y - by);
      return distA - distB;
    });

    return openDirs[0];
  };

  // Compute simulated ultrasonic distance ahead (in cm, 1 cell = 25 cm) & scanned cells within sonar range
  const getSonarScan = (
    rx: number,
    ry: number,
    dir: Direction,
    rangeCm: number = sonarRangeRef.current,
    wallSet: Set<string> = wallsRef.current
  ) => {
    const d = DELTAS[dir];
    const scanCells = new Set<string>();

    let fullSteps = 0;
    let fx = rx + d.dx;
    let fy = ry + d.dy;
    while (isCellOpen(fx, fy, wallSet)) {
      fullSteps++;
      fx += d.dx;
      fy += d.dy;
    }
    const actualDistanceCm = fullSteps * 25 + 10;

    let steps = 0;
    let cx = rx + d.dx;
    let cy = ry + d.dy;
    while (isCellOpen(cx, cy, wallSet) && (steps + 1) * 25 + 10 <= rangeCm) {
      scanCells.add(`${cx},${cy}`);
      steps++;
      cx += d.dx;
      cy += d.dy;
    }

    const obstacleDetected = actualDistanceCm <= rangeCm;
    const obstacleCell =
      obstacleDetected &&
      fx >= 0 &&
      fx < GRID_COLS &&
      fy >= 0 &&
      fy < GRID_ROWS &&
      wallSet.has(`${fx},${fy}`)
        ? `${fx},${fy}`
        : null;

    return {
      distanceCm: actualDistanceCm,
      scanCells,
      obstacleCell,
      obstacleDetected,
      blockedImmediately: fullSteps === 0,
    };
  };

  const moveStep = (
    current: { x: number; y: number; dir: Direction },
    visited?: Map<string, number>
  ) => {
    const d = DELTAS[current.dir];
    const nx = current.x + d.dx;
    const ny = current.y + d.dy;
    if (!isCellOpen(nx, ny)) {
      const nextDir = pickSmartOpenDirection(current.x, current.y, current.dir, wallsRef.current, visited);
      if (nextDir === null) {
        setLogs((prev) => [...prev.slice(-5), 'Enclosed by obstacles on all sides.']);
        return current;
      }
      const reason =
        nx < 0 || nx >= GRID_COLS || ny < 0 || ny >= GRID_ROWS
          ? 'Boundary end detected'
          : `Wall detected at (${nx},${ny})`;
      setLogs((prev) => [...prev.slice(-5), `${reason} — turned to open path.`]);
      return { ...current, dir: nextDir };
    }
    const next = { ...current, x: nx, y: ny };
    if (visited) {
      visited.set(`${nx},${ny}`, (visited.get(`${nx},${ny}`) ?? 0) + 1);
    }
    if (nx === currentMap.goal.x && ny === currentMap.goal.y) {
      setWon(true);
      onGoalReached();
      setLogs((prev) => [...prev.slice(-5), 'Goal Flag Reached! +50 XP']);
    }
    return next;
  };

  const handleManualMove = (action: 'forward' | 'backward' | 'left' | 'right') => {
    setRover((prev) => {
      if (action === 'left') return { ...prev, dir: ((prev.dir + 3) % 4) as Direction };
      if (action === 'right') return { ...prev, dir: ((prev.dir + 1) % 4) as Direction };
      if (action === 'forward') return moveStep(prev, visitedRef.current);
      // backward: step back if open, otherwise turn to another open direction
      const oppositeDir = ((prev.dir + 2) % 4) as Direction;
      const d = DELTAS[oppositeDir];
      const bx = prev.x + d.dx;
      const by = prev.y + d.dy;
      if (!isCellOpen(bx, by)) {
        const nextDir = pickSmartOpenDirection(prev.x, prev.y, prev.dir, wallsRef.current, visitedRef.current);
        if (nextDir === null) return prev;
        setLogs((l) => [...l.slice(-5), 'Rear end/wall detected — turned to open path.']);
        return { ...prev, dir: nextDir };
      }
      const next = { ...prev, x: bx, y: by };
      if (bx === currentMap.goal.x && by === currentMap.goal.y) {
        setWon(true);
        onGoalReached();
        setLogs((l) => [...l.slice(-5), 'Goal Flag Reached! +50 XP']);
      }
      return next;
    });
  };

  // Smart BFS goal/frontier + sonar lookahead direction picker for obstacle-avoiding navigation
  const findBestSmartDirection = (
    rx: number,
    ry: number,
    currentDir: Direction,
    prevCellKey: string,
    liveRange: number,
    liveWalls: Set<string>,
    visited: Map<string, number>
  ): { bestDir: Direction | null; reasonLog?: string } => {
    const allDirs: Direction[] = [
      currentDir,
      ((currentDir + 1) % 4) as Direction,
      ((currentDir + 3) % 4) as Direction,
      ((currentDir + 2) % 4) as Direction,
    ];

    const openDirs = allDirs.filter((dir) => {
      const d = DELTAS[dir];
      return isCellOpen(rx + d.dx, ry + d.dy, liveWalls);
    });

    if (openDirs.length === 0) return { bestDir: null };
    if (openDirs.length === 1) return { bestDir: openDirs[0] };

    const nonBacktrack = openDirs.filter((dir) => {
      const d = DELTAS[dir];
      return `${rx + d.dx},${ry + d.dy}` !== prevCellKey;
    });
    const candidates = nonBacktrack.length > 0 ? nonBacktrack : openDirs;

    const bfsMetrics = (
      startX: number,
      startY: number
    ): { goalDist: number; unvisitedDist: number; areaSize: number } => {
      const seen = new Set<string>([`${rx},${ry}`, `${startX},${startY}`]);
      const q: { x: number; y: number; dist: number }[] = [{ x: startX, y: startY, dist: 1 }];
      let goalDist = Infinity;
      let nearestUnvisited = Infinity;
      let areaSize = 0;

      while (q.length > 0) {
        const cur = q.shift()!;
        areaSize++;
        const key = `${cur.x},${cur.y}`;
        if (cur.x === currentMap.goal.x && cur.y === currentMap.goal.y && cur.dist < goalDist) {
          goalDist = cur.dist;
        }
        if ((visited.get(key) ?? 0) === 0 && cur.dist < nearestUnvisited) {
          nearestUnvisited = cur.dist;
        }
        if (goalDist < Infinity && nearestUnvisited < Infinity && areaSize >= 80) break;

        for (const delta of DELTAS) {
          const nx = cur.x + delta.dx;
          const ny = cur.y + delta.dy;
          const nKey = `${nx},${ny}`;
          if (!seen.has(nKey) && isCellOpen(nx, ny, liveWalls)) {
            seen.add(nKey);
            q.push({ x: nx, y: ny, dist: cur.dist + 1 });
          }
        }
      }
      return { goalDist, unvisitedDist: nearestUnvisited, areaSize };
    };

    const fwdD = DELTAS[currentDir];
    const forwardOpen = isCellOpen(rx + fwdD.dx, ry + fwdD.dy, liveWalls);
    const fwdScan = getSonarScan(rx, ry, currentDir, liveRange, liveWalls);

    const scored = candidates.map((dir) => {
      const d = DELTAS[dir];
      const nx = rx + d.dx;
      const ny = ry + d.dy;
      const scan = getSonarScan(rx, ry, dir, liveRange, liveWalls);
      const bfs = bfsMetrics(nx, ny);
      return {
        dir,
        nx,
        ny,
        scan,
        goalDist: bfs.goalDist,
        bfsDist: bfs.unvisitedDist,
        areaSize: bfs.areaSize,
        visits: visited.get(`${nx},${ny}`) ?? 0,
        isForward: dir === currentDir,
      };
    });

    const goalReachable = scored.some((s) => s.goalDist < Infinity);

    // Once every reachable cell has been explored at least once, start a fresh patrol pass
    if (!goalReachable && scored.every((s) => s.bfsDist === Infinity)) {
      visited.clear();
      visited.set(`${rx},${ry}`, 1);
      scored.forEach((s) => {
        s.visits = 0;
        const bfs = bfsMetrics(s.nx, s.ny);
        s.bfsDist = bfs.unvisitedDist;
      });
    }

    scored.sort((a, b) => {
      if (goalReachable) {
        const aCanReachGoal = a.goalDist < Infinity;
        const bCanReachGoal = b.goalDist < Infinity;
        if (aCanReachGoal !== bCanReachGoal) return aCanReachGoal ? -1 : 1;

        // If sonar detects an obstacle ahead within range, steer into an alternative path
        // that avoids the wall when it stays equally efficient toward the goal.
        if (fwdScan.obstacleDetected && a.goalDist !== Infinity && b.goalDist !== Infinity) {
          const aClear = !a.scan.obstacleDetected;
          const bClear = !b.scan.obstacleDetected;
          if (aClear !== bClear && Math.abs(a.goalDist - b.goalDist) <= 2) {
            return aClear ? -1 : 1;
          }
          if (a.isForward !== b.isForward) {
            const other = a.isForward ? b : a;
            const fwdGoalDist = a.isForward ? a.goalDist : b.goalDist;
            if (other.scan.distanceCm > fwdScan.distanceCm && other.goalDist <= fwdGoalDist) {
              return a.isForward ? 1 : -1;
            }
          }
        }

        if (a.goalDist !== b.goalDist) return a.goalDist - b.goalDist;
      } else {
        const aHasUnvisited = a.bfsDist < Infinity;
        const bHasUnvisited = b.bfsDist < Infinity;
        if (aHasUnvisited !== bHasUnvisited) return aHasUnvisited ? -1 : 1;

        if (fwdScan.obstacleDetected) {
          const aClear = !a.scan.obstacleDetected;
          const bClear = !b.scan.obstacleDetected;
          if (aClear !== bClear && Math.abs(a.bfsDist - b.bfsDist) <= 3) {
            return aClear ? -1 : 1;
          }
          if (a.isForward !== b.isForward) {
            const other = a.isForward ? b : a;
            const fwdBfs = a.isForward ? a.bfsDist : b.bfsDist;
            if (other.scan.distanceCm > fwdScan.distanceCm && other.bfsDist <= fwdBfs + 2) {
              return a.isForward ? 1 : -1;
            }
          }
        }

        if (a.bfsDist !== b.bfsDist) return a.bfsDist - b.bfsDist;
      }

      if (a.visits !== b.visits) return a.visits - b.visits;
      if (a.isForward) return -1;
      if (b.isForward) return 1;
      if (a.scan.distanceCm !== b.scan.distanceCm) return b.scan.distanceCm - a.scan.distanceCm;
      return b.areaSize - a.areaSize;
    });

    const winner = scored[0];
    let reasonLog: string | undefined;
    if (!forwardOpen) {
      const fx = rx + fwdD.dx;
      const fy = ry + fwdD.dy;
      reasonLog =
        fx < 0 || fx >= GRID_COLS || fy < 0 || fy >= GRID_ROWS
          ? 'Arena edge detected -> Turning to open path'
          : `Wall detected at (${fx},${fy}) -> Turning to open path`;
    } else if (fwdScan.obstacleDetected && !winner.isForward) {
      reasonLog = `Sonar (${fwdScan.distanceCm}cm <= ${liveRange}cm) -> Steering around obstacle`;
    }

    return { bestDir: winner.dir, reasonLog };
  };

  const startSmartNavigationLoop = (
    initialRover: { x: number; y: number; dir: Direction },
    initialVisited?: Map<string, number>,
    initialPrevCellKey = '',
    initialGoalAwarded = false
  ) => {
    clearBlockTimer();
    setIsExecutingBlocks(false);

    if (initialRover.x === currentMap.goal.x && initialRover.y === currentMap.goal.y) {
      setWon(true);
      setIsAutoNavigating(false);
      if (!initialGoalAwarded) {
        onGoalReached();
      }
      setLogs((prev) => [
        ...prev.slice(-5),
        `Goal Flag Reached at X:${currentMap.goal.x} Y:${currentMap.goal.y}! Rover stopped.`,
      ]);
      return;
    }

    setIsAutoNavigating(true);

    const visited = initialVisited ?? new Map<string, number>();
    if (!visited.has(`${initialRover.x},${initialRover.y}`)) {
      visited.set(`${initialRover.x},${initialRover.y}`, 1);
    }
    visitedRef.current = visited;

    let simRover = { ...initialRover };
    let prevCellKey = initialPrevCellKey;
    let goalAwardedThisRun = initialGoalAwarded;

    const runTick = () => {
      const liveWalls = wallsRef.current;
      const liveRange = sonarRangeRef.current;

      const { bestDir, reasonLog } = findBestSmartDirection(
        simRover.x,
        simRover.y,
        simRover.dir,
        prevCellKey,
        liveRange,
        liveWalls,
        visited
      );

      if (bestDir === null) {
        clearBlockTimer();
        setIsAutoNavigating(false);
        setLogs((prev) => [...prev.slice(-5), 'No open path — enclosed by walls!']);
        return;
      }

      if (reasonLog) {
        setLogs((prev) => [...prev.slice(-5), reasonLog]);
      }

      prevCellKey = `${simRover.x},${simRover.y}`;
      const stepDelta = DELTAS[bestDir];
      const nextX = simRover.x + stepDelta.dx;
      const nextY = simRover.y + stepDelta.dy;

      simRover = { x: nextX, y: nextY, dir: bestDir };
      visited.set(`${nextX},${nextY}`, (visited.get(`${nextX},${nextY}`) ?? 0) + 1);
      setRover({ ...simRover });

      if (nextX === currentMap.goal.x && nextY === currentMap.goal.y) {
        clearBlockTimer();
        setWon(true);
        setIsAutoNavigating(false);
        setIsExecutingBlocks(false);
        if (!goalAwardedThisRun) {
          goalAwardedThisRun = true;
          onGoalReached();
        }
        setLogs((prev) => [
          ...prev.slice(-5),
          `Goal Flag Reached at X:${nextX} Y:${nextY}! +50 XP — Stopped.`,
        ]);
        return;
      }

      const delayMs = Math.max(120, 500 - speedPctRef.current * 3.5);
      blockTimerRef.current = window.setTimeout(runTick, delayMs);
    };

    const firstDelay = Math.max(120, 500 - speedPctRef.current * 3.5);
    blockTimerRef.current = window.setTimeout(runTick, firstDelay);
  };

  // Continuous Smart Obstacle & Wall-Detecting Goal Navigation
  const toggleAutoNavigate = () => {
    if (isAutoNavigating) {
      clearBlockTimer();
      setIsAutoNavigating(false);
      setLogs((prev) => [...prev.slice(-5), 'Continuous sensor drive stopped.']);
      return;
    }

    const startRover = { ...rover };
    setWon(false);
    const visited = new Map<string, number>();
    visited.set(`${startRover.x},${startRover.y}`, 1);
    setLogs(['Smart Sonar Drive: Navigating around walls toward target flag...']);
    startSmartNavigationLoop(startRover, visited);
  };

  // Run kid's visual block program on the Rover Arena
  const runBlockProgram = () => {
    if (isExecutingBlocks) {
      clearBlockTimer();
      setIsExecutingBlocks(false);
      setLogs((prev) => [...prev.slice(-5), 'Block program stopped.']);
      return;
    }

    clearBlockTimer();
    setIsAutoNavigating(false);
    const startState = { ...currentMap.start };
    const visited = new Map<string, number>();
    visited.set(`${startState.x},${startState.y}`, 1);
    visitedRef.current = visited;

    setRover(startState);
    setWon(false);
    setIsExecutingBlocks(true);
    setLogs(['Running your Visual Block Program...']);

    // Expand repeat blocks into flat action list
    const queue: { type: string; param?: string | number }[] = [];
    let i = 0;
    while (i < blocks.length) {
      const b = blocks[i];
      if (b.type === 'repeat_start') {
        const count = Math.min(6, Math.max(1, Number(b.param ?? 2)));
        const inner: CodeBlock[] = [];
        i++;
        while (i < blocks.length && blocks[i].type !== 'repeat_end') {
          inner.push(blocks[i]);
          i++;
        }
        for (let r = 0; r < count; r++) {
          inner.forEach((ib) => queue.push({ type: ib.type, param: ib.param }));
        }
      } else if (b.type !== 'repeat_end') {
        queue.push({ type: b.type, param: b.param });
      }
      i++;
    }

    // Expand multi-step forward actions
    const expanded: string[] = [];
    queue.forEach((item) => {
      if (item.type === 'rover_forward') {
        const steps = Math.min(8, Math.max(1, Number(item.param ?? 1)));
        for (let s = 0; s < steps; s++) expanded.push('forward');
      } else if (item.type === 'rover_left') {
        expanded.push('left');
      } else if (item.type === 'rover_right') {
        expanded.push('right');
      } else if (item.type === 'if_obstacle') {
        expanded.push('if_obstacle');
      } else if (item.type === 'print_msg') {
        expanded.push(`msg:${String(item.param ?? '')}`);
      }
    });

    if (expanded.length === 0) {
      expanded.push('forward', 'forward', 'right', 'forward');
    }

    let stepIdx = 0;
    let simRover = { ...startState };
    let prevCellKey = '';
    let goalAwarded = false;

    const runStep = () => {
      if (stepIdx >= expanded.length) {
        if (continueAfterBlocksRef.current) {
          setLogs((prev) => [...prev.slice(-5), 'Blocks complete -> Continuing with Sonar Drive...']);
          startSmartNavigationLoop(simRover, visited, prevCellKey, goalAwarded);
          return;
        }
        clearBlockTimer();
        setIsExecutingBlocks(false);
        setLogs((prev) => [...prev.slice(-5), 'Block program finished.']);
        return;
      }

      const cmd = expanded[stepIdx++];
      if (cmd === 'forward') {
        const beforeX = simRover.x;
        const beforeY = simRover.y;
        simRover = moveStep(simRover, visited);
        if (simRover.x !== beforeX || simRover.y !== beforeY) {
          prevCellKey = `${beforeX},${beforeY}`;
        }
        if (simRover.x === currentMap.goal.x && simRover.y === currentMap.goal.y) {
          goalAwarded = true;
          setRover({ ...simRover });
          clearBlockTimer();
          setIsExecutingBlocks(false);
          setIsAutoNavigating(false);
          setLogs((prev) => [
            ...prev.slice(-5),
            `Goal Flag Reached at X:${simRover.x} Y:${simRover.y}! +50 XP — Stopped.`,
          ]);
          return;
        }
      } else if (cmd === 'left') {
        simRover = { ...simRover, dir: ((simRover.dir + 3) % 4) as Direction };
      } else if (cmd === 'right') {
        simRover = { ...simRover, dir: ((simRover.dir + 1) % 4) as Direction };
      } else if (cmd === 'if_obstacle') {
        const activeRange = sonarRangeRef.current;
        const scan = getSonarScan(simRover.x, simRover.y, simRover.dir, activeRange, wallsRef.current);
        if (scan.obstacleDetected) {
          const nextDir = pickSmartOpenDirection(simRover.x, simRover.y, simRover.dir, wallsRef.current, visited);
          if (nextDir !== null) {
            simRover = { ...simRover, dir: nextDir };
            setLogs((prev) => [
              ...prev.slice(-5),
              `Sonar=${scan.distanceCm}cm (<= ${activeRange}cm) -> Turned to open path`,
            ]);
          }
        }
      } else if (cmd.startsWith('msg:')) {
        setLogs((prev) => [...prev.slice(-5), cmd.slice(4)]);
      }

      setRover({ ...simRover });
      const delayMs = Math.max(140, 540 - speedPctRef.current * 3.8);
      blockTimerRef.current = window.setTimeout(runStep, delayMs);
    };

    const initialDelay = Math.max(140, 540 - speedPctRef.current * 3.8);
    blockTimerRef.current = window.setTimeout(runStep, initialDelay);
  };

  // Keyboard arrow control
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        e.preventDefault();
        if (e.key === 'ArrowUp') handleManualMove('forward');
        if (e.key === 'ArrowDown') handleManualMove('backward');
        if (e.key === 'ArrowLeft') handleManualMove('left');
        if (e.key === 'ArrowRight') handleManualMove('right');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMap, walls]);

  const toggleWall = (x: number, y: number) => {
    if ((x === currentMap.start.x && y === currentMap.start.y) || (x === currentMap.goal.x && y === currentMap.goal.y)) {
      return;
    }
    const key = `${x},${y}`;
    setWalls((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sonar = getSonarScan(rover.x, rover.y, rover.dir, sonarRangeCm, walls);
  const sonarCm = sonar.distanceCm;
  const onBlackLine = currentMap.lineCells.includes(`${rover.x},${rover.y}`);
  const rotationDeg = rover.dir * 90;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT STAGE: 2D Grid Arena (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/65 p-3.5 backdrop-blur-md shadow-sm">
            <div className="flex items-center gap-2">
              <label htmlFor="arena-map" className="text-xs font-semibold text-slate-700">
                {t.roverMapSelect}
              </label>
              <select
                id="arena-map"
                value={mapId}
                onChange={(e) => loadMap(e.target.value)}
                className="rounded-lg border border-slate-200/80 bg-white/75 px-3 py-2 text-xs font-medium text-slate-900 backdrop-blur-sm"
              >
                {ARENA_MAPS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {isHi ? m.nameHi : m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleAutoNavigate}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 whitespace-nowrap ${
                  isAutoNavigating
                    ? 'border-amber-400/75 bg-amber-500/20 text-amber-950 hover:bg-amber-500/35 hover:border-amber-500 hover:shadow-[0_6px_18px_rgba(217,119,6,0.25)]'
                    : 'border-emerald-400/75 bg-emerald-500/20 text-emerald-950 hover:bg-emerald-500/35 hover:border-emerald-500 hover:shadow-[0_6px_18px_rgba(5,150,105,0.25)]'
                }`}
              >
                {isAutoNavigating ? (
                  <>
                    <Square className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'ऑटो-सेंसर रोकें' : 'Stop Sensor Drive'}</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'सेंसर से रास्ता खोजें' : 'Auto-Find & Avoid Walls'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={runBlockProgram}
                disabled={isAutoNavigating}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap ${
                  isExecutingBlocks
                    ? 'border-rose-400/75 bg-rose-500/20 text-rose-950 hover:bg-rose-500/35 hover:border-rose-500 hover:shadow-[0_6px_18px_rgba(225,29,72,0.25)]'
                    : 'border-sky-400/75 bg-sky-500/20 text-sky-950 hover:bg-sky-500/35 hover:border-sky-500 hover:shadow-[0_6px_18px_rgba(2,132,199,0.25)]'
                }`}
              >
                {isExecutingBlocks ? (
                  <>
                    <Square className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{isHi ? 'प्रोग्राम रोकें' : 'Stop Block Program'}</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{t.roverRunBlocks}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetRover}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/30 px-3.5 py-2 text-xs font-medium text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300/80 hover:bg-white/60 hover:text-sky-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.1)] active:scale-95 whitespace-nowrap"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t.roverReset}</span>
              </button>
            </div>
          </div>

          {/* 2D Physics Grid */}
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>{t.roverObstacleMode}</span>
              <span
                className={`font-mono tabular-nums ${
                  sonar.obstacleDetected ? 'font-semibold text-amber-700' : 'text-slate-700'
                }`}
              >
                {sonar.obstacleDetected
                  ? `Obstacle / Edge Detected (${sonarCm} cm ≤ ${sonarRangeCm} cm)`
                  : `Ultrasonic Ahead: ${sonarCm} cm (Range: ${sonarRangeCm} cm) · IR Line: ${onBlackLine ? 'BLACK' : 'WHITE'}`}
              </span>
            </div>

            <div className="grid grid-cols-10 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-2.5">
              {Array.from({ length: GRID_ROWS }).map((_, y) =>
                Array.from({ length: GRID_COLS }).map((__, x) => {
                  const key = `${x},${y}`;
                  const isWall = walls.has(key);
                  const isGoal = currentMap.goal.x === x && currentMap.goal.y === y;
                  const isRover = rover.x === x && rover.y === y;
                  const isLine = currentMap.lineCells.includes(key);
                  const isScanned = sonar.scanCells.has(key);
                  const isDetectedWall = sonar.obstacleCell === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleWall(x, y)}
                      aria-label={`Grid cell ${x},${y}`}
                      className={`relative aspect-square rounded-md flex items-center justify-center transition-colors ${
                        isWall
                          ? isDetectedWall
                            ? 'bg-amber-700 ring-2 ring-amber-400 hover:bg-amber-600'
                            : 'bg-slate-800 hover:bg-slate-700'
                          : isGoal
                          ? 'bg-emerald-100 border border-emerald-400'
                          : isScanned
                          ? 'bg-sky-50 border border-sky-200 hover:bg-sky-100'
                          : isLine
                          ? 'bg-slate-300 border border-slate-400'
                          : 'bg-white hover:bg-sky-50 border border-slate-200/70'
                      }`}
                    >
                      {isGoal && !isRover && (
                        <Flag className="h-5 w-5 text-emerald-600" aria-label="Goal Flag" />
                      )}
                      {isRover && (
                        <div
                          className="flex h-4/5 w-4/5 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm transition-transform duration-150"
                          style={{ transform: `rotate(${rotationDeg}deg)` }}
                        >
                          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {won && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span>
                  {isHi
                    ? 'शाबाश! आपका रोवर सफलतापूर्वक लक्ष्य तक पहुँच गया!'
                    : 'Great engineering! Your rover reached the target flag!'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT DECK: D-Pad + Telemetry (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">{t.roverManualControl}</h3>

            <div className="mx-auto grid w-44 grid-cols-3 gap-2">
              <div />
              <button
                type="button"
                onClick={() => handleManualMove('forward')}
                aria-label="Drive Forward"
                className="flex h-12 items-center justify-center rounded-full border border-white/80 bg-white/30 text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-500/20 hover:text-sky-950 hover:shadow-[0_6px_16px_rgba(2,132,199,0.2)] active:scale-95"
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <div />
              <button
                type="button"
                onClick={() => handleManualMove('left')}
                aria-label="Turn Left"
                className="flex h-12 items-center justify-center rounded-full border border-white/80 bg-white/30 text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-500/20 hover:text-sky-950 hover:shadow-[0_6px_16px_rgba(2,132,199,0.2)] active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleManualMove('backward')}
                aria-label="Drive Backward"
                className="flex h-12 items-center justify-center rounded-full border border-white/80 bg-white/30 text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-500/20 hover:text-sky-950 hover:shadow-[0_6px_16px_rgba(2,132,199,0.2)] active:scale-95"
              >
                <ArrowDown className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleManualMove('right')}
                aria-label="Turn Right"
                className="flex h-12 items-center justify-center rounded-full border border-white/80 bg-white/30 text-slate-800 backdrop-blur-md shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/80 hover:bg-sky-500/20 hover:text-sky-950 hover:shadow-[0_6px_16px_rgba(2,132,199,0.2)] active:scale-95"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <label className="mt-4 block space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>{isHi ? 'रोवर स्पीड (PWM)' : 'Motor Speed (PWM)'}</span>
                <span className="font-mono tabular-nums text-sky-700">{speedPct}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={100}
                value={speedPct}
                onChange={(e) => setSpeedPct(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </label>

            <label className="mt-4 block space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-700">
                <span>{isHi ? 'सोनार दूरी (रेंज)' : 'Sonar Detection Distance'}</span>
                <span className="font-mono tabular-nums text-sky-700">{sonarRangeCm} cm</span>
              </div>
              <input
                type="range"
                min={10}
                max={160}
                step={5}
                value={sonarRangeCm}
                onChange={(e) => setSonarRangeCm(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
                <span>10 cm</span>
                <span>85 cm</span>
                <span>160 cm</span>
              </div>
            </label>

            <label className="mt-3 flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={continueAfterBlocks}
                onChange={(e) => setContinueAfterBlocks(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-sky-600"
              />
              <span>
                {isHi
                  ? 'ब्लॉक्स के बाद सोनार से लगातार आगे बढ़ें'
                  : 'Keep roaming with Sonar after blocks'}
              </span>
            </label>
          </div>

          <div className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-md shadow-sm">
            <h3 className="text-xs font-semibold text-slate-900 mb-2">
              {isHi ? 'लाइव रोवर सेंसर व लॉग' : 'Live Rover Telemetry'}
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="rounded-lg border border-white/70 bg-white/60 p-2.5 backdrop-blur-sm">
                <div className="text-slate-500">Position</div>
                <div className="font-mono font-semibold tabular-nums text-slate-900">
                  X:{rover.x} Y:{rover.y}
                </div>
              </div>
              <div className="rounded-lg border border-white/70 bg-white/60 p-2.5 backdrop-blur-sm">
                <div className="text-slate-500">Sonar Distance</div>
                <div className="font-mono font-semibold tabular-nums text-sky-700">
                  {sonarCm} cm{' '}
                  <span className="text-[11px] font-normal text-slate-500">/ {sonarRangeCm} cm</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-900/90 p-3 font-mono text-xs text-slate-200 backdrop-blur-sm space-y-1">
              {logs.map((line, i) => (
                <div key={i} className="truncate">{line}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <BeginnerHintBox
        isHi={isHi}
        title={isHi ? 'रोवर एरीना गाइड (Beginner)' : 'Rover Project Guide & Hints'}
        liveHint={
          won
            ? isHi
              ? `बढ़िया! रोवर झंडे (X:${currentMap.goal.x} Y:${currentMap.goal.y}) तक पहुँच गया। नया मैप चुनें या ग्रिड पर नई दीवारें बनाकर फिर से चलाएँ!`
              : `Great job! Your rover reached the flag (X:${currentMap.goal.x} Y:${currentMap.goal.y}). Try switching maps, drawing new walls, or changing Sonar Distance!`
            : isAutoNavigating || isExecutingBlocks
            ? isHi
              ? `रोवर चल रहा है! सोनार दूरी (${sonarRangeCm} cm) या स्पीड स्लाइडर को लाइव बदलकर देखें, या रास्ते में नई दीवारें जोड़ें।`
              : `Rover is active! Try adjusting Sonar Detection Distance (${sonarRangeCm} cm) or Speed live, or click grid cells to place obstacles.`
            : isHi
            ? 'खाली ग्रिड सेल पर क्लिक करके अपनी दीवारें बनाएँ, सोनार दूरी सेट करें, और "Auto-Find & Avoid Walls" या "Run Block Program" दबाएँ।'
            : 'Click empty grid cells to draw obstacle walls, adjust Sonar Detection Distance, and press "Auto-Find & Avoid Walls" or "Run Block Program".'
        }
        steps={
          isHi
            ? [
                'ग्रिड के किसी भी खाली बॉक्स पर क्लिक करके बाधा वाली दीवार जोड़ें या हटाएँ।',
                'दाईं ओर Sonar Detection Distance (10–160 cm) स्लाइडर से तय करें कि रोवर कितनी दूर से दीवार पहचाने।',
                '"Auto-Find & Avoid Walls" या "Run Block Program" दबाएँ — रोवर झंडे तक पहुँचकर रुक जाएगा!',
              ]
            : [
                'Click any empty square on the grid to add or remove custom obstacle walls.',
                'Use the Sonar Detection Distance slider (10–160 cm) to control how early the rover detects obstacles.',
                'Click "Auto-Find & Avoid Walls" or "Run Block Program" — the rover avoids walls and stops at the flag!',
              ]
        }
      />
    </section>
  );
};
