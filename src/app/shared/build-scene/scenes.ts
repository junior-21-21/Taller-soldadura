import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Escenas de armado: puerta, ventana, mesa y techo.
 * Cada escena se dibuja en un SVG de 800×620 y su línea de tiempo
 * avanza con el scroll (piezas que llegan, cordones de soldadura que se enfrían).
 */

export type SceneName = 'puerta' | 'ventana' | 'mesa' | 'techo';
export type HudFn = (progress: number, weldsDone: number, weldsTotal: number, welding: boolean) => void;
export type WeldAt = (x: number, y: number) => void;

const NS = 'http://www.w3.org/2000/svg';
const HOT = '#fff4c8', WARM = '#ff8a1e', COOL = '#77716a';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}, parent?: Element): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

/** Gradientes y texturas compartidas por todas las escenas (se insertan una vez) */
export function ensureDefs(): void {
  if (document.getElementById('rr-scene-defs')) return;
  const svg = el('svg', { id: 'rr-scene-defs', width: 0, height: 0, 'aria-hidden': 'true', style: 'position:absolute' }, document.body);
  svg.innerHTML = `
    <defs>
      <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3d4148"/><stop offset=".28" stop-color="#c9cdd3"/>
        <stop offset=".5" stop-color="#8a9098"/><stop offset="1" stop-color="#33363c"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M40 0H0V40" fill="none" stroke="rgba(255,150,60,.07)" stroke-width="1"/>
      </pattern>
      <pattern id="tread" width="18" height="18" patternUnits="userSpaceOnUse">
        <rect width="18" height="18" fill="#5d6269"/>
        <rect x="3" y="7" width="9" height="3" rx="1.5" fill="#9ba1a9" transform="rotate(35 7.5 8.5)"/>
        <rect x="9" y="1" width="9" height="3" rx="1.5" fill="#9ba1a9" transform="rotate(-35 13.5 2.5)"/>
      </pattern>
      <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9fd3ff" stop-opacity=".45"/><stop offset=".5" stop-color="#4a8fc9" stop-opacity=".25"/>
        <stop offset="1" stop-color="#9fd3ff" stop-opacity=".4"/>
      </linearGradient>
      <pattern id="brick" width="60" height="30" patternUnits="userSpaceOnUse">
        <rect width="60" height="30" fill="#3a2418"/>
        <path d="M0 15H60M0 30H60M30 0V15M0 15V30M60 15V30" stroke="#24150e" stroke-width="3"/>
      </pattern>
      <pattern id="calL" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-34.35)">
        <rect width="14" height="14" fill="#8f969e"/><rect width="5" height="14" fill="#c6cbd1"/><rect x="11" width="3" height="14" fill="#5e646b"/>
      </pattern>
      <pattern id="calR" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(34.35)">
        <rect width="14" height="14" fill="#8f969e"/><rect width="5" height="14" fill="#c6cbd1"/><rect x="11" width="3" height="14" fill="#5e646b"/>
      </pattern>
      <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7a4a26"/><stop offset=".5" stop-color="#9a6234"/><stop offset="1" stop-color="#6d4020"/>
      </linearGradient>
      <pattern id="planks" width="100" height="22" patternUnits="userSpaceOnUse">
        <rect width="100" height="22" fill="url(#wood)"/>
        <path d="M0 21.5H100" stroke="#3b2210" stroke-width="1.5"/>
        <path d="M8 6 C30 3 50 9 92 5 M14 14 C40 11 64 17 96 13" stroke="rgba(40,20,8,.35)" fill="none"/>
      </pattern>
      <linearGradient id="woodBase" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#c47a3c"/><stop offset=".45" stop-color="#b0632a"/><stop offset="1" stop-color="#9a5222"/>
      </linearGradient>
      <pattern id="woodGrain" width="240" height="64" patternUnits="userSpaceOnUse">
        <rect width="240" height="64" fill="url(#woodBase)"/>
        <path d="M0 8 C40 4 80 12 120 8 S200 4 240 9 M0 21 C50 17 90 26 140 21 S210 18 240 22 M0 35 C30 31 70 39 110 34 S190 30 240 36 M0 49 C60 45 100 53 150 48 S220 46 240 50 M0 59 C40 56 90 62 130 58 S200 55 240 60"
          fill="none" stroke="rgba(90,38,10,.24)" stroke-width="1"/>
        <path d="M10 14 C60 11 110 17 170 13 M30 42 C80 39 140 45 220 41" fill="none" stroke="rgba(255,214,160,.1)" stroke-width="2"/>
        <ellipse cx="170" cy="28" rx="16" ry="4" fill="none" stroke="rgba(90,38,10,.3)"/>
      </pattern>
      <linearGradient id="graphite" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2b2f35"/><stop offset=".3" stop-color="#5d636c"/>
        <stop offset=".55" stop-color="#3f444b"/><stop offset="1" stop-color="#202328"/>
      </linearGradient>
      <linearGradient id="blackSteel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#121315"/><stop offset=".3" stop-color="#3a3d42"/>
        <stop offset=".55" stop-color="#1d1f22"/><stop offset="1" stop-color="#0c0d0e"/>
      </linearGradient>
      <linearGradient id="inox" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#7c838b"/><stop offset=".35" stop-color="#f4f6f8"/>
        <stop offset=".6" stop-color="#a7aeb5"/><stop offset="1" stop-color="#5d636a"/>
      </linearGradient>
      <pattern id="blocks" width="60" height="40" patternUnits="userSpaceOnUse">
        <rect width="60" height="40" fill="#8f877b"/>
        <path d="M0 0H60M0 20H60M15 0V20M45 20V40" stroke="#6f685e" stroke-width="2"/>
        <path d="M30 4 L40 10 L30 16 L20 10 Z M0 24 L10 30 L0 36 M60 24 L50 30 L60 36" fill="none" stroke="rgba(60,55,48,.45)"/>
      </pattern>
      <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <filter id="beadGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
}

type FromVars = (i: number) => gsap.TweenVars;

/** Arma una escena y su línea de tiempo */
export class Director {
  readonly tl: gsap.core.Timeline | null;
  readonly stepTimes: number[] = [];
  private weldStates: { p: number }[] = [];
  t = 0;
  private ghost: SVGGElement;
  back: SVGGElement;
  mid: SVGGElement;
  front: SVGGElement;
  private welds: SVGGElement;
  /** Capa sobre los cordones: forros y acabados que los tapan */
  over: SVGGElement;
  private top: SVGGElement;

  constructor(private svg: SVGSVGElement, animate: boolean, private weldAt: WeldAt) {
    this.tl = animate ? gsap.timeline({ paused: true }) : null;
    el('line', { x1: 40, y1: 596, x2: 760, y2: 596, stroke: 'rgba(255,150,60,.25)', 'stroke-width': 2 }, svg);
    this.ghost = el('g', { fill: 'none', stroke: 'rgba(255,170,80,.28)', 'stroke-dasharray': '6 6' }, svg);
    this.back = el('g', {}, svg);
    this.mid = el('g', {}, svg);
    this.front = el('g', {}, svg);
    this.welds = el('g', {}, svg);
    this.over = el('g', {}, svg);
    this.top = el('g', {}, svg);
  }

  /** Tubo cuadrado de (x1,y1) a (x2,y2) con espesor w; deja su silueta punteada en el plano */
  bar(x1: number, y1: number, x2: number, y2: number, w: number, fill = 'url(#steel)'): SVGGElement {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const tr = `translate(${x1} ${y1}) rotate(${ang})`;
    el('rect', { x: -w / 2, y: -w / 2, width: len + w, height: w, transform: tr }, this.ghost);
    const g = el('g', {}, this.mid);
    const inner = el('g', { transform: tr }, g);
    el('rect', { x: -w / 2, y: -w / 2, width: len + w, height: w, fill, stroke: '#1b1d21', 'stroke-width': 1 }, inner);
    el('rect', { x: -w / 2 + 2, y: -w / 2 + w * 0.2, width: len + w - 4, height: Math.max(1, w * 0.1), fill: fill === 'url(#steel)' ? 'rgba(255,255,255,.35)' : 'rgba(255,255,255,.14)' }, inner);
    return g;
  }

  /** Pieza de atrás (vista en perspectiva): más oscura */
  dim(...pieces: Element[]): void {
    const g = el('g', { opacity: 0.55 }, this.mid);
    this.mid.insertBefore(g, this.mid.firstChild);
    pieces.forEach(p => g.appendChild(p));
  }

  step(): void { this.stepTimes.push(this.t); }

  /** Piezas que llegan a su sitio */
  fly(pieces: Element[], from: FromVars, stagger = 0.18): void {
    if (!this.tl) return;
    pieces.forEach((p, i) => {
      this.tl!.from(p, { ...from(i), opacity: 0, duration: 1, ease: 'power3.out', transformOrigin: '50% 50%' }, this.t + i * stagger);
    });
    this.t += 1 + (pieces.length - 1) * stagger;
  }

  /** Cordones de soldadura: cada uno es una lista plana [x1,y1,x2,y2,...] */
  weld(list: number[][]): void {
    list.forEach(pts => {
      let d = `M${pts[0]} ${pts[1]}`;
      for (let i = 2; i < pts.length; i += 2) d += ` L${pts[i]} ${pts[i + 1]}`;
      const path = el('path', { d, fill: 'none' }, this.welds);
      const len = path.getTotalLength();
      const g = el('g', { fill: this.tl ? HOT : COOL, filter: 'url(#beadGlow)' }, this.welds);
      const n = Math.max(2, Math.round(len / 2.6));
      const dots: SVGCircleElement[] = [];
      for (let i = 0; i <= n; i++) {
        const p = path.getPointAtLength(len * i / n);
        dots.push(el('circle', {
          cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: rand(3.6, 4.6).toFixed(1),
          stroke: 'rgba(0,0,0,.35)', 'stroke-width': 0.7,
          visibility: this.tl ? 'hidden' : 'visible',
        }, g));
      }
      if (!this.tl) { this.weldStates.push({ p: 1 }); return; }

      const dur = clamp(len / 60, 0.3, 1.1);
      const st = { p: 0 };
      this.weldStates.push(st);
      let shown = 0;
      const svg = this.svg;
      const weldAt = this.weldAt;
      this.tl.to(st, {
        p: 1, duration: dur, ease: 'none',
        onUpdate() {
          const k = Math.round(st.p * dots.length);
          for (let i = Math.min(k, shown); i < Math.max(k, shown); i++) {
            dots[i].setAttribute('visibility', i < k ? 'visible' : 'hidden');
          }
          shown = k;
          if (st.p > 0 && st.p < 1) {
            const pt = path.getPointAtLength(st.p * len);
            const sp = svg.createSVGPoint();
            sp.x = pt.x; sp.y = pt.y;
            const s = sp.matrixTransform(svg.getScreenCTM()!);
            weldAt(s.x, s.y);
          }
        },
      }, this.t);
      // El cordón se enfría: blanco → naranja → gris acero
      this.tl.to(g, { attr: { fill: WARM }, duration: 0.5, ease: 'none' }, this.t + dur);
      this.tl.to(g, { attr: { fill: COOL }, duration: 1.4, ease: 'none' }, this.t + dur + 0.5);
      this.t += dur + 0.12;
    });
  }

  show(target: Element, vars: gsap.TweenVars, dur = 1): void {
    if (!this.tl) return;
    this.tl.from(target, { opacity: 0, duration: dur, ease: 'power3.out', transformOrigin: '50% 50%', ...vars }, this.t);
    this.t += dur;
  }

  /** Brillo de pintura recorriendo la pieza terminada */
  shine(x: number, y: number, w: number, h: number): void {
    const id = 'clip' + Math.random().toString(36).slice(2, 8);
    const cp = el('clipPath', { id }, this.top);
    el('rect', { x, y, width: w, height: h }, cp);
    const g = el('g', { 'clip-path': `url(#${id})` }, this.top);
    const r = el('rect', { x: x - 260, y: y - 40, width: 160, height: h + 80, fill: 'url(#shine)', transform: 'skewX(-18)', opacity: this.tl ? 1 : 0 }, g);
    if (!this.tl) return;
    this.tl.fromTo(r, { x: 0 }, { x: w + 420, duration: 1.2, ease: 'power1.inOut' }, this.t);
    this.t += 0.8;
  }

  stamp(text: string, x: number, y: number): void {
    const g = el('g', { transform: `translate(${x} ${y}) rotate(-8)` }, this.top);
    const inner = el('g', {}, g);
    const w = text.length * 15 + 40;
    el('rect', { x: -w / 2, y: -26, width: w, height: 52, rx: 6, fill: 'rgba(255,122,0,.08)', stroke: '#ff7a00', 'stroke-width': 3 }, inner);
    const t = el('text', {
      x: 0, y: 0, 'text-anchor': 'middle', 'dominant-baseline': 'central',
      'font-family': 'Oswald, Impact, sans-serif', 'font-weight': 700, 'font-size': 30, 'letter-spacing': 2, fill: '#ffb627',
    }, inner);
    t.textContent = text;
    // Sello: entra un poco más grande y se asienta, sin partir de escala 0
    this.show(inner, { scale: 1.25, rotation: 4, ease: 'back.out(1.6)' }, 0.5);
  }

  /** Arranca la línea de tiempo al aparecer la escena y marca el paso actual */
  attach(section: HTMLElement, steps: HTMLElement[], hud?: HudFn): ScrollTrigger | null {
    const report = () => {
      if (!hud) return;
      const done = this.weldStates.filter(w => w.p >= 1).length;
      const welding = this.weldStates.some(w => w.p > 0 && w.p < 1);
      hud(this.tl ? this.tl.progress() : 1, done, this.weldStates.length, welding);
    };
    const mark = (time: number) => {
      report();
      let idx = -1;
      this.stepTimes.forEach((t, i) => { if (time >= t) idx = i; });
      const done = this.tl ? time >= this.tl.duration() - 0.01 : true;
      steps.forEach((li, i) => {
        li.classList.toggle('done', done || i < idx);
        li.classList.toggle('active', !done && i === idx);
      });
    };
    if (!this.tl) { mark(Infinity); return null; }
    const tl = this.tl;
    tl.eventCallback('onUpdate', () => mark(tl.time()));
    mark(0);
    // Sin bloquear el scroll: la pieza se arma sola (unos 5 s) y vuelve a empezar en bucle.
    // Solo corre mientras está en pantalla.
    tl.timeScale(tl.duration() / 5);
    let active = false;
    let again: gsap.core.Tween | null = null;
    // restart sin suprimir eventos: los cordones vuelven a ocultarse
    const restart = () => { again = null; if (active && section.isConnected) tl.restart(false, false); };
    tl.eventCallback('onComplete', () => { again = gsap.delayedCall(2.2, restart); });
    return ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 20%',
      onToggle: self => {
        active = self.isActive;
        if (!active) { tl.pause(); return; }
        if (tl.progress() >= 1) { if (!again) restart(); }
        else tl.play();
      },
    });
  }
}

/* ------------------------------------------------------------------ */
/* Escena 1: puerta moderna con acabado madera                         */
/* ------------------------------------------------------------------ */
function puerta(D: Director): void {
  // Marco (contramarco) y hoja de tubo; luego se forra con paneles acabado madera
  const ML = D.bar(240, 40, 240, 584, 18);
  const MR = D.bar(560, 40, 560, 584, 18);
  const MT = D.bar(240, 40, 560, 40, 18);
  const HL = D.bar(268, 68, 268, 568, 14);
  const HR = D.bar(532, 68, 532, 568, 14);
  const HT = D.bar(268, 68, 532, 68, 14);
  const HB = D.bar(268, 568, 532, 568, 14);
  const ys = [168, 268, 368, 468];
  const ribs = ys.map(y => D.bar(275, y, 525, y, 8));

  // Paneles horizontales acabado madera con bruña entre cada uno
  const panels: SVGGElement[] = [];
  const top = 59, h = (575 - top) / 5;
  for (let i = 0; i < 5; i++) {
    const g = el('g', {}, D.over);
    const y = top + i * h;
    el('rect', { x: 259, y, width: 282, height: h - 3, fill: 'url(#woodGrain)', stroke: '#6a3410', 'stroke-width': 1 }, g);
    el('rect', { x: 259, y: y + h - 3, width: 282, height: 3, fill: '#3a1a06' }, g);
    el('rect', { x: 259, y, width: 282, height: 2, fill: 'rgba(255,220,170,.25)' }, g);
    panels.push(g);
  }
  // Forro del marco en madera
  const frameWood = el('g', {}, D.over);
  el('path', { d: 'M231 31 H569 V593 H551 V49 H249 V593 H231 Z', fill: 'url(#woodGrain)', stroke: '#5a2b0c', 'stroke-width': 1.5 }, frameWood);
  el('path', { d: 'M249 49 H551', stroke: 'rgba(0,0,0,.35)', 'stroke-width': 2 }, frameWood);
  // Jalador largo de acero inoxidable + chapa
  const handle = el('g', {}, D.over);
  el('rect', { x: 298, y: 210, width: 10, height: 250, rx: 5, fill: 'url(#inox)', stroke: '#3b3f44' }, handle);
  el('rect', { x: 294, y: 228, width: 6, height: 8, fill: '#9aa1a8' }, handle);
  el('rect', { x: 294, y: 434, width: 6, height: 8, fill: '#9aa1a8' }, handle);
  el('circle', { cx: 280, cy: 318, r: 7, fill: 'url(#inox)', stroke: '#3b3f44' }, handle);
  el('circle', { cx: 280, cy: 340, r: 6, fill: 'url(#inox)', stroke: '#3b3f44' }, handle);
  el('rect', { x: 278.5, y: 337, width: 3, height: 6, fill: '#2a2d31' }, handle);

  D.step();
  D.fly([ML, MR], i => ({ x: i ? 320 : -320, rotation: i ? 10 : -10 }));
  D.fly([MT], () => ({ y: -260 }));
  D.weld([[249, 75, 249, 49, 275, 49], [525, 49, 551, 49, 551, 75]]);
  D.step();
  D.fly([HL, HR, HT, HB], i => (i < 2 ? { x: i ? 300 : -300 } : { y: i === 2 ? -300 : 300 }), 0.12);
  D.weld([
    [275, 95, 275, 75, 295, 75], [505, 75, 525, 75, 525, 95],
    [525, 541, 525, 561, 505, 561], [295, 561, 275, 561, 275, 541],
  ]);
  D.step();
  D.fly(ribs, i => ({ x: i % 2 ? 420 : -420 }), 0.1);
  D.weld(ys.flatMap(y => [[275, y - 8, 275, y + 8], [525, y - 8, 525, y + 8]]));
  D.step();
  D.fly(panels, i => ({ x: i % 2 ? 380 : -380, rotation: i % 2 ? 4 : -4 }), 0.16);
  D.show(frameWood, {}, 0.6);
  D.step();
  D.show(handle, { y: 30 }, 0.6);
  D.shine(231, 31, 338, 562);
  D.stamp('PUERTA LISTA', 680, 110);
}

/* ------------------------------------------------------------------ */
/* Escena 2: ventana moderna con reja geométrica                       */
/* ------------------------------------------------------------------ */
function ventana(D: Director): void {
  const wall = el('rect', { x: 100, y: 40, width: 600, height: 520, fill: 'url(#blocks)', opacity: 0.5 }, D.back);
  const glass = el('g', {}, D.back);
  el('rect', { x: 228, y: 118, width: 344, height: 324, fill: '#0b1520' }, glass);
  el('rect', { x: 228, y: 118, width: 344, height: 324, fill: 'url(#glass)' }, glass);
  el('path', { d: 'M260 420 L420 140 M300 430 L470 136', stroke: 'rgba(255,255,255,.18)', 'stroke-width': 6, 'stroke-linecap': 'round' }, glass);

  const G = 'url(#graphite)';
  const L = D.bar(220, 110, 220, 450, 16, G);
  const R = D.bar(580, 110, 580, 450, 16, G);
  const T = D.bar(220, 110, 580, 110, 16, G);
  const B = D.bar(220, 450, 580, 450, 16, G);
  const vL = D.bar(272, 118, 272, 442, 10, G);
  const vR = D.bar(528, 118, 528, 442, 10, G);
  // Barras horizontales alternadas: una nace del marco izquierdo, la siguiente del derecho
  const ys = [158, 198, 238, 278, 318, 358, 398];
  const bars = ys.map((y, i) => (i % 2 ? D.bar(272, y, 572, y, 10, G) : D.bar(228, y, 528, y, 10, G)));
  const sill = D.bar(196, 466, 604, 466, 12, G);

  D.step();
  D.fly([T, B], i => ({ x: i ? 420 : -420, rotation: i ? 6 : -6 }));
  D.fly([L, R], i => ({ y: i ? 300 : -300 }));
  D.step();
  D.weld([
    [228, 140, 228, 118, 250, 118], [550, 118, 572, 118, 572, 140],
    [572, 420, 572, 442, 550, 442], [250, 442, 228, 442, 228, 420],
  ]);
  D.step();
  D.fly([vL, vR], i => ({ y: i ? 380 : -380 }));
  D.weld([[266, 118, 278, 118], [522, 442, 534, 442]]);
  D.step();
  D.fly(bars, i => ({ x: i % 2 ? 460 : -460 }), 0.12);
  D.weld(ys.map((y, i) => (i % 2 ? [572, y - 6, 572, y + 6] : [228, y - 6, 228, y + 6])));
  D.weld(ys.map((y, i) => (i % 2 ? [272, y - 6, 272, y + 6] : [528, y - 6, 528, y + 6])));
  D.step();
  D.show(glass, {});
  D.fly([sill], () => ({ y: 80 }));
  D.show(wall, {}, 0.6);
  D.shine(212, 102, 376, 356);
  D.stamp('VENTANA LISTA', 650, 70);
}

/* ------------------------------------------------------------------ */
/* Escena: mesa de comedor con patas trapecio (vista en 3/4)            */
/* ------------------------------------------------------------------ */
function mesa(D: Director): void {
  // Tablero grueso de madera: cara superior, canto frontal y lateral
  const top = el('g', {}, D.front);
  el('polygon', { points: '140,280 660,280 734,224 214,224', fill: 'url(#woodGrain)', stroke: '#5a2b0c', 'stroke-width': 1.5 }, top);
  el('rect', { x: 140, y: 280, width: 520, height: 28, fill: 'url(#woodGrain)', stroke: '#5a2b0c' }, top);
  el('rect', { x: 140, y: 280, width: 520, height: 28, fill: 'rgba(40,16,4,.35)' }, top);
  el('polygon', { points: '660,280 734,224 734,252 660,308', fill: '#6e3814', stroke: '#5a2b0c' }, top);
  el('path', { d: 'M180 270 L690 236', stroke: 'rgba(255,230,190,.18)', 'stroke-width': 10, 'stroke-linecap': 'round' }, top);

  // Patas trapecio de tubo negro: marco delantero y su gemelo atrás (más oscuro)
  const K = 'url(#blackSteel)';
  const frame = (x0: number, x1: number) => {
    const inset = (x1 - x0) * 0.24;
    const a: [number, number] = [x0, 316], b: [number, number] = [x1, 316];
    const c: [number, number] = [x1 - inset, 584], d: [number, number] = [x0 + inset, 584];
    const ox = 62, oy = -47;
    const back = el('g', {}, D.mid);
    [[a, d], [b, c], [d, c]].forEach(([p, q]) => back.appendChild(D.bar(p[0] + ox, p[1] + oy, q[0] + ox, q[1] + oy, 16, K)));
    D.dim(back);
    return {
      top: D.bar(a[0], a[1], b[0], b[1], 16, K),
      front: D.bar(a[0], a[1], d[0], d[1], 16, K),
      side: D.bar(b[0], b[1], c[0], c[1], 16, K),
      foot: D.bar(d[0], d[1], c[0], c[1], 16, K),
      back, a, b, c, d,
    };
  };
  const L = frame(158, 262), R = frame(538, 642);
  const corners = (f: ReturnType<typeof frame>) => [
    [f.a[0] + 10, f.a[1] + 30, f.a[0] + 10, f.a[1] + 8, f.a[0] + 32, f.a[1] + 8],
    [f.b[0] - 32, f.b[1] + 8, f.b[0] - 10, f.b[1] + 8, f.b[0] - 10, f.b[1] + 30],
    [f.d[0] + 6, f.d[1] - 28, f.d[0] + 8, f.d[1] - 8, f.d[0] + 30, f.d[1] - 8],
    [f.c[0] - 30, f.c[1] - 8, f.c[0] - 8, f.c[1] - 8, f.c[0] - 6, f.c[1] - 28],
  ];

  D.step();
  D.fly([L.front, L.side, R.front, R.side], i => ({ y: -360, rotation: i % 2 ? 8 : -8 }), 0.1);
  D.fly([L.back, R.back], () => ({ y: -300 }), 0.1);
  D.step();
  D.fly([L.top, R.top], i => ({ x: i ? 300 : -300, y: -120 }));
  D.fly([L.foot, R.foot], i => ({ x: i ? 260 : -260, y: 80 }));
  D.step();
  D.weld([...corners(L), ...corners(R)]);
  D.step();
  D.show(top, { y: -220 }, 1.1);
  D.shine(140, 224, 594, 84);
  D.stamp('MESA LISTA', 640, 110);
}

/* ------------------------------------------------------------------ */
/* Escena 3: techo con tijeral                                          */
/* ------------------------------------------------------------------ */
function techo(D: Director): void {
  const slope = 205 / 300;
  const yTop = (x: number) => (x <= 400 ? 420 - (x - 100) * slope : 215 + (x - 400) * slope);
  const ang = Math.atan(slope) * 180 / Math.PI;

  // Calamina sobre las cuerdas superiores
  const roof = el('g', {}, D.front);
  const sheet = (xa: number, ya: number, xb: number, yb: number, pat: string) => {
    const off = 20, th = 10;
    el('polygon', {
      points: `${xa},${ya - off} ${xb},${yb - off} ${xb},${yb - off - th} ${xa},${ya - off - th}`,
      fill: `url(#${pat})`, stroke: '#3c4047', 'stroke-width': 1,
    }, roof);
  };
  sheet(74, 420 + 26 * slope, 400, 215, 'calL');
  sheet(400, 215, 726, 420 + 26 * slope, 'calR');
  el('path', { d: 'M388 186 L400 177 L412 186 L412 196 L400 187 L388 196 Z', fill: '#a9afb6', stroke: '#3c4047' }, roof);

  const colL = D.bar(110, 426, 110, 588, 16);
  const colR = D.bar(690, 426, 690, 588, 16);
  const plates = el('g', {}, D.mid);
  el('rect', { x: 90, y: 588, width: 40, height: 8, fill: '#6b7078' }, plates);
  el('rect', { x: 670, y: 588, width: 40, height: 8, fill: '#6b7078' }, plates);
  const bottom = D.bar(100, 420, 700, 420, 12);
  const topL = D.bar(100, 420, 400, 215, 12);
  const topR = D.bar(400, 215, 700, 420, 12);
  const king = D.bar(400, 215, 400, 420, 8);
  const v1 = D.bar(250, yTop(250), 250, 420, 7);
  const v2 = D.bar(550, yTop(550), 550, 420, 7);
  const d1 = D.bar(250, yTop(250), 400, 420, 7);
  const d2 = D.bar(550, yTop(550), 400, 420, 7);

  // Correas (vistas de perfil) sobre la cuerda superior
  const purlins: SVGGElement[] = [];
  [0.12, 0.32, 0.52, 0.72, 0.92].forEach(t => {
    ([[100, 400, -ang], [400, 700, ang]] as const).forEach(([a, b, rot]) => {
      const x = a + (b - a) * t, y = yTop(x);
      const g = el('g', {}, D.mid);
      el('rect', { x: -7, y: -20, width: 14, height: 13, fill: 'url(#steel)', stroke: '#1b1d21', transform: `translate(${x} ${y}) rotate(${rot})` }, g);
      purlins.push(g);
    });
  });

  D.step();
  D.fly([colL, colR, plates], () => ({ y: 300 }), 0.12);
  D.fly([bottom], () => ({ x: -600 }));
  D.weld([[98, 427, 122, 427], [678, 427, 702, 427]]);
  D.step();
  D.fly([topL, topR], i => ({ x: i ? 380 : -380, y: -200, rotation: i ? 14 : -14 }));
  D.fly([king, v1, v2, d1, d2], () => ({ y: -320 }), 0.1);
  D.step();
  D.weld([
    [388, 228, 412, 228], [386, 413, 414, 413],
    [242, 413, 258, 413], [542, 413, 558, 413],
    [240, 331, 260, 318], [540, 318, 560, 331],
  ]);
  D.step();
  D.fly(purlins, () => ({ y: -140 }), 0.06);
  D.step();
  D.show(roof, { y: -200 }, 1.1);
  D.shine(70, 160, 660, 280);
  D.stamp('TECHO LISTO', 640, 90);
}

export const builders: Record<SceneName, (d: Director) => void> = { puerta, ventana, mesa, techo };
