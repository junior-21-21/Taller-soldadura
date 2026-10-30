import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, viewChild } from '@angular/core';
import { WeldFxService } from './weld-fx.service';

interface Spark { x: number; y: number; vx: number; vy: number; life: number; decay: number; w: number; }

const rand = (a: number, b: number) => a + Math.random() * (b - a);

@Component({
  selector: 'app-weld-fx',
  templateUrl: './weld-fx.component.html',
  styleUrl: './weld-fx.component.css'
})
export class WeldFxComponent implements OnDestroy {
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private arcEl = viewChild.required<ElementRef<HTMLDivElement>>('arc');
  private flashEl = viewChild.required<ElementRef<HTMLDivElement>>('flash');
  private electrodeEl = viewChild.required<ElementRef<HTMLDivElement>>('electrode');
  private rodEl = viewChild.required<ElementRef<HTMLSpanElement>>('rod');

  private sparks: Spark[] = [];
  private raf = 0;
  private cleanup: (() => void)[] = [];

  constructor(private fx: WeldFxService, private zone: NgZone, private host: ElementRef<HTMLElement>) {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.start()));
  }

  private start(): void {
    const canvas = this.canvas().nativeElement;
    const ctx = canvas.getContext('2d')!;
    const arcEl = this.arcEl().nativeElement;
    const flashEl = this.flashEl().nativeElement;
    const electrodeEl = this.electrodeEl().nativeElement;
    const rod = this.rodEl().nativeElement;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    // Electrodo lateral que se consume al bajar
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? scrollY / max : 0;
      rod.style.setProperty('--rod', Math.max(0.04, 1 - p).toFixed(3));
    };
    addEventListener('resize', resize);
    addEventListener('scroll', onScroll, { passive: true });
    this.cleanup.push(() => removeEventListener('resize', resize), () => removeEventListener('scroll', onScroll));
    resize();
    onScroll();
    if (reduceMotion) return;

    const emit = (x: number, y: number, n: number, power = 1) => {
      for (let i = 0; i < n && this.sparks.length < 900; i++) {
        // Rociado hacia arriba y a los lados, como salen del charco de soldadura
        const a = -Math.PI / 2 + rand(-1, 1) * Math.PI * 0.78;
        const v = rand(2, 9) * power;
        this.sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: rand(0.012, 0.03), w: rand(0.8, 2.2) });
      }
    };

    // blanco → amarillo → naranja → rojo a medida que se enfría
    const color = (l: number) =>
      l > 0.75 ? `rgba(255,190,40,${l})` :
      l > 0.5 ? `rgba(255,140,0,${l})` :
      l > 0.25 ? `rgba(235,85,0,${l + 0.1})` : `rgba(180,40,0,${l * 1.6})`;

    const frame = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      const arc = this.fx.arc;

      if (now - arc.t < 90) {
        arcEl.style.opacity = rand(0.75, 1).toFixed(2);
        arcEl.style.transform = `translate(${arc.x}px, ${arc.y}px) scale(${rand(0.65, 1.3).toFixed(2)})`;
        electrodeEl.style.transform = `translate(${arc.x}px, ${arc.y}px) rotate(-38deg)`;
        electrodeEl.classList.add('on');
        flashEl.style.setProperty('--fx', arc.x + 'px');
        flashEl.style.setProperty('--fy', arc.y + 'px');
        flashEl.style.opacity = rand(0.45, 0.9).toFixed(2);
        emit(arc.x, arc.y, Math.round(rand(3, 7)));
        if (Math.random() < 0.07) emit(arc.x, arc.y, 22, 1.25);
      } else {
        arcEl.style.opacity = '0';
        flashEl.style.opacity = '0';
        electrodeEl.classList.remove('on');
      }

      // Chispas ambientales del logo del inicio
      const anchor = this.fx.heroAnchor;
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        if (r.top > -50 && r.top < H) {
          if (Math.random() < 0.55) emit(r.left, r.top, Math.round(rand(1, 3)), 0.55);
          if (Math.random() < 0.015) emit(r.left, r.top, 26, 0.9);
        }
      }

      ctx.globalCompositeOperation = 'source-over'; // fondo claro: sin suma de luz
      ctx.lineCap = 'round';
      for (let i = this.sparks.length - 1; i >= 0; i--) {
        const p = this.sparks[i];
        p.vy += 0.22;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        if (p.y > H - 2) { p.y = H - 2; p.vy *= -0.35; p.vx *= 0.6; }
        p.life -= p.decay;
        if (p.life <= 0) { this.sparks.splice(i, 1); continue; }
        ctx.strokeStyle = color(p.life);
        ctx.lineWidth = p.w * (0.6 + p.life * 0.6);
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  ngOnDestroy(): void {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.raf);
    this.cleanup.forEach(fn => fn());
  }
}
