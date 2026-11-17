"use client";

import * as React from "react";

export interface LanyardLink {
  label: string;
  href: string;
}

export interface LanyardMember {
  id: string;
  name: string;
  role: string;
  team?: string;
  image: string;
  about?: string;
  quote?: string;
  bio?: string;
  tags?: string[];
  links?: LanyardLink[];
  tone?: 1 | 2 | 3 | 4 | 5;
  drop?: number;
}

export interface TeamLanyardRailLabels {
  flip: string;
  back: string;
}

export interface TeamLanyardRailProps extends React.ComponentProps<"section"> {
  items: LanyardMember[];
  eyebrow?: string;
  heading?: string;
  lead?: string;
  caption?: string;
  autoplay?: boolean;
  interval?: number;
  active?: number | null;
  onActiveChange?: (index: number | null) => void;
  flipped?: number | null;
  onFlippedChange?: (index: number | null) => void;
  labels?: TeamLanyardRailLabels;
}

const BADGE_W = 210;
const BADGE_H = 336;
const RATIO = BADGE_H / BADGE_W; // 1.6
const CAROUSEL_PITCH = 250;
const EM = 13;
const PERSPECTIVE = 1000;
const MAX_STRETCH = 72;
const SWING_K = 28;
const SWING_DAMP = 2.2;
const LAG = 0.12;
const REEL_K = 220;
const REEL_ZETA = 0.5;
const REST_Y = [8, -9, 7, -8, 9, -7, 8, -9];
const REST_Z = [-1.5, 1.2, -1.8, 1.5, -1.2, 1.6, -1.4, 1.8];
const DROPS = [8, 22, 0, 16, 26, 6, 20, 10];
const TONES = ["text-chart-1", "text-chart-2", "text-chart-3", "text-chart-4", "text-chart-5"] as const;

const DEFAULT_LABELS: TeamLanyardRailLabels = {
  flip: "Click badge to discover their craft story",
  back: "Click badge again to turn it back to the front",
};

const METAL = "linear-gradient(to right, color-mix(in oklab, var(--color-muted-foreground) 70%, black), color-mix(in oklab, var(--color-muted-foreground) 22%, white) 38%, var(--color-muted-foreground) 70%, color-mix(in oklab, var(--color-muted-foreground) 65%, black))";
const PLASTIC = "linear-gradient(180deg, color-mix(in oklab, var(--color-muted-foreground) 30%, var(--color-background)), color-mix(in oklab, var(--color-muted-foreground) 72%, var(--color-background)))";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function random(seed: number) {
  let a = seed || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function barcode(seed: number) {
  const next = random(seed ^ 0x9e3779b9);
  let x = 0;
  let d = "";
  while (x < 110) {
    const w = 1 + Math.floor(next() * 3);
    d += `M${x} 0h${w}v24h-${w}z`;
    x += w + 1 + Math.floor(next() * 2.5);
  }
  return { d, width: x };
}

function soft(distance: number, max: number) {
  const knee = max * 0.75;
  if (distance <= knee) return distance;
  return knee + (max - knee) * (1 - Math.exp(-(distance - knee) / (max - knee)));
}

function geometry(W: number, items: LanyardMember[]) {
  const u = W / BADGE_W;
  const H = W * RATIO;
  const railR = Math.max(4, 5 * u);
  const railY = 16 + railR;
  const ring = 11 * u;
  const pivotY = railY + ring * 0.8;
  const strapW = Math.max(14, 20 * u);
  const crimp = 8 * u;
  const reel = 26 * u;
  const cordRest = 14 * u;
  const clipH = 18 * u;
  const clipW = 38 * u;
  const base = 64 * u;
  const straps = items.map((item, i) => base + Math.max(0, item.drop ?? DROPS[i % DROPS.length] ?? 0) * u);
  const reelTops = straps.map((len) => pivotY + len + crimp * 0.6);
  const clipTops = reelTops.map((top) => top + reel * 0.82 + cordRest);
  const cardTops = clipTops.map((top) => top + clipH * 0.62);
  const pendulum = cardTops.map((top) => top + H / 2 - pivotY);
  const restLength = pivotY + base + crimp * 0.6 + reel * 0.82 + cordRest + clipH * 0.62 + H / 2 - pivotY;
  const bottom = Math.max(0, ...cardTops.map((top) => top + H));
  return {
    W, H, u, railR, railY, ring, pivotY, strapW, crimp, reel, cordRest, clipH, clipW, straps, reelTops, clipTops, cardTops, pendulum,
    swingK: pendulum.map((len) => (SWING_K * restLength) / len),
    couple: pendulum.map((len) => (0.25 * 57.3) / len),
    maxStretch: Math.round(MAX_STRETCH * Math.min(1, W / 180)),
    height: Math.ceil(bottom + 32 * u),
  };
}

function layoutCarouselTargets(stageWidth: number, centerIndex: number, count: number, swipeOffset: number = 0) {
  const pitch = CAROUSEL_PITCH;
  const total = pitch * count;
  const c = centerIndex ?? 0;
  const xs = Array.from({ length: count }, (_, i) => {
    let k = i - c;
    while (k > count / 2) k -= count;
    while (k <= -count / 2) k += count;
    return stageWidth / 2 + k * pitch + swipeOffset;
  });
  return { xs, total, pitch };
}

type Sim = {
  x: number[]; vx: number[]; px: number[]; tx: number[];
  sw: number[]; vsw: number[]; beta: number[];
  ry: number[]; vry: number[]; tr: number[];
  rz: number[]; vrz: number[]; tz: number[];
  lift: number[]; vlift: number[]; tl: number[];
  pop: number[]; vpop: number[]; tp: number[];
  st: number[]; vst: number[];
  drag: number; grab: number; pull: number; free: number; last: number; raf: number;
};

function emptySim(): Sim {
  return {
    x: [], vx: [], px: [], tx: [], sw: [], vsw: [], beta: [], ry: [], vry: [], tr: [], rz: [], vrz: [], tz: [],
    lift: [], vlift: [], tl: [], pop: [], vpop: [], tp: [], st: [], vst: [],
    drag: -1, grab: 0, pull: -1, free: 0, last: 0, raf: 0,
  };
}

function spring(value: number[], velocity: number[], target: number, i: number, k: number, zeta: number, h: number) {
  const v = velocity[i] ?? 0;
  const x = value[i] ?? 0;
  const next = v + (-k * (x - target) - 2 * zeta * Math.sqrt(k) * v) * h;
  velocity[i] = next;
  value[i] = x + next * h;
}

function LinkIcon({ label }: { label: string }) {
  if (/mail|@|say hello/i.test(label)) {
    return (
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[1.05em] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <rect x="2" y="3.5" width="12" height="9" rx="1.6" />
        <path d="M2.6 4.6 8 8.9l5.4-4.3" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[1.05em] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 11 11 5M6.2 5H11v4.8" />
    </svg>
  );
}

const LINK_ROW = "inline-flex items-center gap-[0.35em] rounded-[0.4em] px-[0.45em] py-[0.18em] text-[0.72em] font-semibold leading-tight";

function Band({ tone, short }: { tone: string; short?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-0 top-0 block ${tone} ${short ? "h-[1.6em]" : "h-[3.6em]"}`}
      style={{
        background: "linear-gradient(180deg, color-mix(in oklab, currentColor 80%, white), currentColor 72%, color-mix(in oklab, currentColor 86%, black))"
      }}
    >
      <span className="absolute inset-x-0 bottom-0 h-px bg-black/15" />
    </span>
  );
}

function Hole() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-1/2 top-[0.65em] block h-[0.45em] w-[1.4em] -translate-x-1/2 rounded-full bg-background"
      style={{ boxShadow: "inset 0 0.09em 0.2em color-mix(in oklab, black 65%, transparent), 0 0.05em 0 color-mix(in oklab, white 30%, transparent)" }}
    />
  );
}

function Finish() {
  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-1/2 block w-[200%] opacity-70 dark:opacity-35" style={{ background: "linear-gradient(100deg, transparent 40%, color-mix(in oklab, white 26%, transparent) 48%, color-mix(in oklab, white 8%, transparent) 52%, transparent 58%)", transform: "translateX(var(--gx, 0%))" }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 block bg-black" style={{ opacity: "var(--shade, 0)" }} />
    </>
  );
}

const BadgeFaces = React.memo(function BadgeFaces({ item, tone }: { item: LanyardMember; tone: string }) {
  const seed = hash(`${item.id}:${item.name}`);
  const bars = barcode(seed);
  const digits = String(seed % 1000000000).padStart(9, "0");
  const tags = (item.tags || []).slice(0, 3);
  const links = (item.links || []).slice(0, 2);

  return (
    <>
      {/* FRONT FACE */}
      <span
        data-face="front"
        className="absolute inset-0 block overflow-hidden rounded-[1em] bg-card text-card-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] [backface-visibility:hidden]"
      >
        <Band tone={tone} />
        <Hole />
        <span className="absolute left-1/2 top-[1.8em] block size-[6.5em] -translate-x-1/2 overflow-hidden rounded-full border-[3px] border-white/20 bg-muted shadow-lg">
          <img src={item.image} alt={item.name} className="size-full object-cover" draggable={false} />
        </span>
        <span className="absolute inset-x-[0.6em] top-[8.8em] block truncate text-center text-[1.05em] font-bold tracking-tight text-foreground">
          {item.name}
        </span>
        <span className="absolute inset-x-[0.6em] top-[10.4em] block truncate text-center text-[0.68em] font-semibold uppercase tracking-wider text-chart-1">
          {item.role}
        </span>
        {item.team && (
          <span className="absolute inset-x-[0.6em] top-[11.8em] block truncate text-center text-[0.62em] text-muted-foreground">
            {item.team}
          </span>
        )}
        <span className="absolute bottom-[2.5em] left-1/2 block w-[8em] -translate-x-1/2">
          <svg viewBox={`0 0 ${bars.width} 24`} className="block h-[1.3em] w-full" preserveAspectRatio="none">
            <path d={bars.d} fill="currentColor" />
          </svg>
          <span className="mt-[0.1em] block text-center font-mono text-[0.58em] tracking-widest text-muted-foreground">
            {digits}
          </span>
        </span>
        <span className="absolute bottom-[0.8em] inset-x-0 block text-center text-[0.65em] font-medium text-chart-1">
          Click to discover craft story
        </span>
        <Finish />
      </span>

      {/* BACK FACE — Professional Profile & Things They Say */}
      <span
        data-face="back"
        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-[1em] bg-[#141211] p-[1.1em] text-card-foreground border border-white/10 shadow-none [backface-visibility:hidden] [transform:rotateY(180deg)]"
      >
        <Band tone={tone} short />
        <Hole />
        <div className="relative z-10 flex flex-col gap-[0.3em] pt-[0.6em]">
          <span className="text-[0.6em] font-bold uppercase tracking-widest text-muted-foreground">
            {item.team || "Flavoro · Artisan"}
          </span>
          <h4 className="text-[1.05em] font-bold leading-tight text-foreground">
            {item.name}
          </h4>
          <span className="text-[0.64em] font-medium text-muted-foreground">
            {item.role}
          </span>
          <div className="my-[0.25em] h-px w-full bg-white/10" />
          
          {/* About */}
          <div className="flex flex-col gap-[0.15em]">
            <span className="text-[0.55em] font-bold uppercase tracking-wider text-muted-foreground">ABOUT</span>
            <p className="text-[0.68em] leading-[1.42] text-[#d4ccc2]">
              {item.about || item.bio}
            </p>
          </div>

          {/* Things They Say */}
          {item.quote && (
            <div className="mt-[0.2em] border-l-2 border-white/20 pl-[0.5em]">
              <span className="block text-[0.52em] font-bold uppercase tracking-wider text-muted-foreground">IN THEIR WORDS</span>
              <p className="text-[0.66em] italic leading-[1.42] text-foreground">
                {item.quote}
              </p>
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-col gap-[0.4em]">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-[0.25em]">
              {tags.map((tag) => (
                <span key={tag} className="rounded bg-white/10 px-[0.4em] py-[0.14em] text-[0.55em] font-semibold uppercase tracking-wider text-[#ded7ce]">
                  {tag}
                </span>
              ))}
            </div>
          )}
          <span className="text-[0.56em] text-muted-foreground">
            Click card to turn back
          </span>
        </div>
        <Finish />
      </span>
    </>
  );
});

export function TeamLanyardRail({
  items,
  eyebrow = "THE SOUL OF THE HEARTH",
  heading = "The hands behind the fire.",
  lead = "Cooking with live embers leaves nowhere to hide. Every loaf, pour, sear, and greeting is guided by eight artisans devoted to patience, warmth, and the wild terroir of California.",
  autoplay = true,
  interval = 3800,
  active: activeProp,
  onActiveChange,
  flipped: flippedProp,
  onFlippedChange,
  labels = DEFAULT_LABELS,
  className,
  ...rest
}: TeamLanyardRailProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = items.length;
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const slots = React.useRef<(HTMLDivElement | null)[]>([]);
  const swings = React.useRef<(HTMLSpanElement | null)[]>([]);
  const straps = React.useRef<(HTMLSpanElement | null)[]>([]);
  const cords = React.useRef<(HTMLSpanElement | null)[]>([]);
  const hangs = React.useRef<(HTMLSpanElement | null)[]>([]);
  const buttons = React.useRef<(HTMLButtonElement | null)[]>([]);
  const flips = React.useRef<(HTMLSpanElement | null)[]>([]);
  const shadows = React.useRef<(HTMLSpanElement | null)[]>([]);
  const sim = React.useRef(emptySim());
  const [stageWidth, setStageWidth] = React.useState(1200);
  const [centerIndex, setCenterIndex] = React.useState(0);
  const [flippedIndex, setFlippedIndex] = React.useState<number | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);

  const geo = React.useMemo(() => geometry(BADGE_W, items), [items]);

  const goTo = React.useCallback((index: number, flip = false) => {
    const nextIdx = ((index % count) + count) % count;
    setCenterIndex(nextIdx);
    setFlippedIndex(flip ? nextIdx : null);
    onActiveChange?.(nextIdx);
  }, [count, onActiveChange]);

  const toggle = React.useCallback((index: number) => {
    setFlippedIndex((prev) => (prev === index ? null : index));
  }, []);

  // Autoplay loop
  React.useEffect(() => {
    if (!autoplay || reduced || isHovered || flippedIndex !== null) return;
    const timer = setInterval(() => {
      goTo(centerIndex + 1);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, reduced, isHovered, flippedIndex, centerIndex, interval, goTo]);

  React.useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => setStageWidth(stage.clientWidth || 1200);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const paint = React.useCallback((i: number) => {
    const s = sim.current;
    const slot = slots.current[i];
    if (!slot) return;
    slot.style.transform = `translate3d(${((s.x[i] ?? 0) - geo.W / 2).toFixed(2)}px,0,0)`;
    const sw = s.sw[i] ?? 0;
    if (swings.current[i]) swings.current[i]!.style.transform = `rotate(${sw.toFixed(3)}deg)`;
    const st = s.st[i] ?? 0;
    straps.current[i]?.style.setProperty("--stretch", `${st.toFixed(2)}px`);
    if (cords.current[i]) cords.current[i]!.style.transform = `scaleY(${Math.max(0.12, (geo.cordRest + st) / geo.cordRest).toFixed(4)})`;
    const lift = s.lift[i] ?? 0;
    const pop = s.pop[i] ?? 0;
    if (hangs.current[i]) {
      hangs.current[i]!.style.transform = `translate3d(0,${(st - 4 * lift).toFixed(2)}px,0) rotate(${((s.beta[i] ?? 0) - sw + (s.rz[i] ?? 0)).toFixed(3)}deg) scale(${(1 + 0.08 * pop).toFixed(4)})`;
    }
    const ry = s.ry[i] ?? 0;
    const facing = Math.abs(Math.cos((ry * Math.PI) / 180));
    if (flips.current[i]) {
      flips.current[i]!.style.transform = `perspective(${PERSPECTIVE}px) rotateY(${ry.toFixed(2)}deg)`;
      flips.current[i]!.style.setProperty('--shade', ((1 - facing) * 0.45).toFixed(3));
      const phi = ((((ry + 90) % 180) + 180) % 180) - 90;
      flips.current[i]!.style.setProperty('--gx', `${(phi * 0.9).toFixed(1)}%`);
    }
    if (shadows.current[i]) {
      shadows.current[i]!.style.transform = `translate3d(${(geo.W * 0.045 + lift * 3 * geo.u).toFixed(2)}px,${(geo.H * 0.03 + lift * 7 * geo.u).toFixed(2)}px,0) scale(${(Math.max(0.12, facing) * (1 + 0.03 * lift + 0.05 * pop)).toFixed(3)},${(1 + 0.03 * lift + 0.05 * pop).toFixed(3)})`;
      shadows.current[i]!.style.opacity = (0.72 + 0.28 * lift).toFixed(3);
    }
  }, [geo]);

  const step = React.useCallback((now: number) => {
    const s = sim.current;
    const dt = s.last ? Math.min(0.1, (now - s.last) / 1000) : 1 / 60;
    s.last = now;
    const sub = Math.max(3, Math.ceil(dt / 0.006));
    const h = dt / sub;
    let busy = false;

    for (let k = 0; k < sub; k++) {
      for (let i = 0; i < count; i++) {
        const before = s.vx[i] ?? 0;
        if (i !== s.drag) {
          const restoring = now > s.free;
          const ax = restoring ? -130 * ((s.x[i] ?? 0) - (s.tx[i] ?? 0)) - 2 * Math.sqrt(130) * 0.86 * before : -3.2 * before;
          s.vx[i] = before + ax * h;
          s.x[i] = (s.x[i] ?? 0) + (s.vx[i] ?? 0) * h;
        }
      }
      for (let i = 0; i < count; i++) {
        const dv = (s.vx[i] ?? 0) - (s.px[i] ?? 0);
        s.px[i] = s.vx[i] ?? 0;
        if (i !== s.pull) {
          const sw = s.sw[i] ?? 0;
          const vsw = clamp((s.vsw[i] ?? 0) + (geo.couple[i] ?? 0.07) * clamp(dv, -900, 900), -90, 90);
          const next = vsw + (-(geo.swingK[i] ?? SWING_K) * sw - SWING_DAMP * vsw) * h;
          s.vsw[i] = next;
          s.sw[i] = clamp(sw + next * h, -18, 18);
        }
        s.beta[i] = (s.beta[i] ?? 0) + ((s.sw[i] ?? 0) - (s.beta[i] ?? 0)) * Math.min(1, h / LAG);
        spring(s.ry, s.vry, s.tr[i] ?? 0, i, 170, 0.62, h);
        spring(s.rz, s.vrz, s.tz[i] ?? 0, i, 120, 0.8, h);
        spring(s.lift, s.vlift, s.tl[i] ?? 0, i, 200, 0.75, h);
        spring(s.pop, s.vpop, s.tp[i] ?? 0, i, 160, 0.55, h);
        if (i !== s.pull) {
          spring(s.st, s.vst, 0, i, REEL_K, REEL_ZETA, h);
          s.st[i] = Math.max(-geo.cordRest * 0.85, s.st[i] ?? 0);
        }
      }
    }

    for (let i = 0; i < count; i++) {
      paint(i);
      if (
        Math.abs(s.vx[i] ?? 0) > 0.4 ||
        Math.abs((s.x[i] ?? 0) - (s.tx[i] ?? 0)) > 0.25 ||
        Math.abs((s.ry[i] ?? 0) - (s.tr[i] ?? 0)) > 0.05 ||
        Math.abs(s.sw[i] ?? 0) > 0.02 ||
        Math.abs(s.st[i] ?? 0) > 0.05
      ) busy = true;
    }

    if (s.drag >= 0 || s.pull >= 0 || now < s.free) busy = true;
    if (busy) s.raf = requestAnimationFrame(step);
    else {
      s.raf = 0;
      s.last = 0;
    }
  }, [count, geo, paint]);

  const kick = React.useCallback(() => {
    const s = sim.current;
    if (reduced) return;
    if (!s.raf) {
      s.last = 0;
      s.raf = requestAnimationFrame(step);
    }
  }, [reduced, step]);

  React.useLayoutEffect(() => {
    const s = sim.current;
    const { xs, total } = layoutCarouselTargets(stageWidth, centerIndex, count, 0);
    const fresh = s.x.length !== count;
    for (let i = 0; i < count; i++) {
      const targetX = xs[i] ?? 0;
      if (!fresh && total > 0) {
        const shift = Math.round((targetX - (s.x[i] ?? targetX)) / total) * total;
        if (shift !== 0) s.x[i] = (s.x[i] ?? 0) + shift;
      }
      s.tx[i] = targetX;
      const isCenter = centerIndex === i;
      const isFlipped = flippedIndex === i;
      s.tr[i] = isFlipped ? 180 : isCenter ? 0 : (REST_Y[i % REST_Y.length] ?? 0);
      s.tz[i] = (isCenter || isFlipped) ? 0 : (REST_Z[i % REST_Z.length] ?? 0);
      s.tl[i] = (isCenter || isFlipped) ? 1 : 0;
      s.tp[i] = isFlipped ? 1 : 0;
      if (fresh) {
        s.x[i] = targetX;
        s.vx[i] = 0;
        s.sw[i] = 0;
        s.vsw[i] = 0;
        s.st[i] = 0;
      }
    }
    for (const key of ["x", "vx", "px", "tx", "sw", "vsw", "beta", "ry", "vry", "tr", "rz", "vrz", "tz", "lift", "vlift", "tl", "pop", "vpop", "tp", "st", "vst"] as const) {
      s[key].length = count;
    }
    if (fresh) for (let i = 0; i < count; i++) paint(i);
    kick();
  }, [stageWidth, centerIndex, flippedIndex, count, geo, paint, kick]);

  const currentPerson = (flippedIndex !== null && items[flippedIndex]) ? items[flippedIndex] : items[centerIndex];
  const isShowingBack = flippedIndex !== null;

  return (
    <section
      {...rest}
      data-slot="team-lanyard-rail"
      className={`relative isolate w-full overflow-hidden bg-background text-foreground ${className ?? ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <header className="relative z-10 flex flex-col items-center gap-2 px-6 pt-12 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-chart-1">{eyebrow}</p>
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">{heading}</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{lead}</p>
      </header>

      <div className="relative mt-8 w-full select-none overflow-hidden">
        {/* Left/Right Buttons */}
        <button
          type="button"
          onClick={() => goTo(centerIndex - 1)}
          aria-label="Previous artisan"
          className="absolute left-6 top-1/2 z-40 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 hover:border-chart-1"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          type="button"
          onClick={() => goTo(centerIndex + 1)}
          aria-label="Next artisan"
          className="absolute right-6 top-1/2 z-40 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-transform hover:scale-110 hover:border-chart-1"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <div
          ref={stageRef}
          data-stage
          role="region"
          aria-label="Team Lanyard Carousel"
          className="relative flex items-start justify-center"
          style={{ height: geo.height }}
        >
          {/* Continuous Overhead Rail */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 z-0" style={{ top: geo.railY - geo.railR, height: geo.railR * 2 }}>
            <div className="absolute inset-x-0 h-3 rounded-full bg-foreground/10 blur-[5px]" style={{ top: geo.railR * 2 + 2 }} />
            <div className="absolute inset-0 rounded-full" style={{ background: METAL, boxShadow: "0 1px 0 color-mix(in oklab, var(--color-foreground) 18%, transparent)" }} />
          </div>

          {items.map((item, i) => {
            const tone = TONES[((item.tone ?? (i % 5) + 1) - 1) % TONES.length] ?? TONES[0];
            const isCenter = centerIndex === i;
            const isFlipped = flippedIndex === i;
            const strap = geo.straps[i] ?? 0;
            const reelTop = geo.reelTops[i] ?? 0;
            const clipTop = geo.clipTops[i] ?? 0;
            const cardOffset = (geo.cardTops[i] ?? 0) - clipTop;

            return (
              <div
                key={item.id}
                ref={(node) => { slots.current[i] = node; }}
                data-lanyard={i}
                className={`pointer-events-none absolute left-0 top-0 ${tone}`}
                style={{ width: BADGE_W, height: geo.height, zIndex: isFlipped ? 40 : isCenter ? 30 : 10 }}
              >
                <span
                  aria-hidden="true"
                  className="absolute block rounded-full"
                  style={{
                    left: BADGE_W / 2 - 4.5 * geo.u,
                    top: geo.railY - geo.ring,
                    width: 9 * geo.u,
                    height: geo.ring * 2,
                    border: `${Math.max(1.6, 2.2 * geo.u).toFixed(2)}px solid color-mix(in oklab, var(--color-muted-foreground) 45%, white)`
                  }}
                />

                <span
                  ref={(node) => { swings.current[i] = node; }}
                  data-swing
                  className="absolute inset-0 block"
                  style={{ transformOrigin: `${BADGE_W / 2}px ${geo.pivotY}px` }}
                >
                  <span
                    ref={(node) => { straps.current[i] = node; }}
                    data-strap
                    aria-hidden="true"
                    className="absolute inset-0 block"
                    style={{ ["--stretch" as string]: "0px" }}
                  >
                    <span
                      className="absolute block"
                      style={{
                        left: BADGE_W / 2 - geo.strapW / 2,
                        top: geo.pivotY - 2,
                        width: geo.strapW,
                        height: strap + 2,
                        background: "linear-gradient(90deg, color-mix(in oklab, currentColor 68%, black) 0%, currentColor 16%, color-mix(in oklab, currentColor 86%, white) 48%, currentColor 80%, color-mix(in oklab, currentColor 66%, black) 100%)",
                      }}
                    />
                    <span
                      className="absolute block rounded-[2px]"
                      style={{ left: BADGE_W / 2 - geo.strapW / 2 - 1.5, top: geo.pivotY + strap - geo.crimp * 0.4, width: geo.strapW + 3, height: geo.crimp, background: METAL }}
                    />
                    <span
                      className="absolute block rounded-full"
                      style={{ left: BADGE_W / 2 - geo.reel / 2, top: reelTop, width: geo.reel, height: geo.reel, background: METAL }}
                    />
                    <span
                      ref={(node) => { cords.current[i] = node; }}
                      className="absolute block w-[1.5px] bg-foreground/60"
                      style={{ left: BADGE_W / 2 - 0.75, top: reelTop + geo.reel * 0.82, height: geo.cordRest, transformOrigin: "50% 0" }}
                    />
                  </span>

                  <span
                    ref={(node) => { hangs.current[i] = node; }}
                    data-hang
                    className="absolute left-0 block"
                    style={{ top: clipTop, width: BADGE_W, height: cardOffset + geo.H, transformOrigin: `${BADGE_W / 2}px 0px` }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-0 block"
                      style={{ top: cardOffset, width: BADGE_W, height: geo.H, filter: `blur(${Math.max(4, 8 * geo.u).toFixed(1)}px)` }}
                    >
                      <span ref={(node) => { shadows.current[i] = node; }} data-shadow className="absolute inset-0 block rounded-[16px] bg-black/45" />
                    </span>

                    <button
                      ref={(node) => { buttons.current[i] = node; }}
                      type="button"
                      data-badge={i}
                      data-flipped={isFlipped ? "true" : "false"}
                      aria-label={`${item.name}, ${item.role} - Click to flip story`}
                      aria-pressed={isFlipped}
                      className="pointer-events-auto absolute left-0 cursor-pointer rounded-[1em] p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-chart-1"
                      style={{ top: cardOffset, width: BADGE_W, height: geo.H, fontSize: EM }}
                      onClick={() => toggle(i)}
                    >
                      <span
                        ref={(node) => { flips.current[i] = node; }}
                        data-flip
                        className="absolute inset-0 block [transform-style:preserve-3d]"
                      >
                        <BadgeFaces item={item} tone={tone} />
                      </span>
                    </button>

                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute block"
                      style={{ left: BADGE_W / 2 - geo.clipW / 2, top: 0, width: geo.clipW, height: geo.clipH + 10 * geo.u }}
                    >
                      <span className="absolute inset-x-0 top-0 block" style={{ height: geo.clipH, background: PLASTIC }} />
                    </span>
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TeamLanyardRail;
