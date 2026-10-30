import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, viewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BuildSceneComponent } from '../../shared/build-scene/build-scene.component';
import { ModelosComponent } from '../../shared/modelos/modelos.component';
import { SceneName } from '../../shared/build-scene/scenes';
import { WeldFxService } from '../../shared/weld-fx/weld-fx.service';

interface Escena {
  scene: SceneName;
  num: string;
  heading: string;
  text: string;
  label: string;
  steps: string[];
  flip?: boolean;
}
interface Servicio { icon: string; titulo: string; texto: string; tag: string; }
interface Paso { titulo: string; texto: string; }
interface Testimonio { foto: string; texto: string; autor: string; }

/** Punto del cordón que el visitante suelda en el inicio */
interface BeadDot { x: number; y: number; t: number; r: number; }

@Component({
  selector: 'app-home',
  imports: [RouterModule, BuildSceneComponent, ModelosComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnDestroy {
  verMapa = false;
  private hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private trail = viewChild.required<ElementRef<HTMLCanvasElement>>('trail');
  private heroArc = viewChild.required<ElementRef<HTMLElement>>('heroArc');
  private coords = viewChild.required<ElementRef<HTMLElement>>('coords');
  private demoLine = viewChild.required<ElementRef<HTMLElement>>('demoLine');
  private rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private stage3d = viewChild.required<ElementRef<HTMLElement>>('stage3d');
  private status3d = viewChild.required<ElementRef<HTMLElement>>('status3d');

  private cleanup: (() => void)[] = [];

  escenas: Escena[] = [
    {
      scene: 'puerta', num: '01', heading: 'Puertas modernas',
      text: 'Marco y hoja de tubo soldados a escuadra, forrados con paneles acabado madera y jalador largo de acero inoxidable. Lucen como madera y resisten como acero.',
      label: 'Puerta moderna acabado madera armándose con soldadura',
      steps: ['Marco de tubo y soldadura', 'Hoja de la puerta', 'Refuerzos internos', 'Paneles acabado madera', 'Jalador inoxidable y chapa'],
    },
    {
      scene: 'ventana', num: '02', heading: 'Ventanas modernas', flip: true,
      text: 'Rejas de diseño geométrico que protegen y decoran a la vez. Marco y barras en color grafito, soldadas limpias y a la medida de tu vano.',
      label: 'Ventana moderna con reja geométrica armándose con soldadura',
      steps: ['Marco perimetral', 'Soldadura de esquinas', 'Parantes verticales', 'Reja geométrica alternada', 'Vidrio y alféizar'],
    },
    {
      scene: 'mesa', num: '03', heading: 'Mesas y mobiliario',
      text: 'Patas trapecio de tubo negro y tablero grueso de madera. Estilo moderno para comedores, oficinas y negocios, firmes y a tu medida.',
      label: 'Mesa moderna con patas trapecio armándose con soldadura',
      steps: ['Patas de tubo negro', 'Cierre del trapecio', 'Soldadura de esquinas', 'Tablero de madera'],
    },
    {
      scene: 'techo', num: '04', heading: 'Techos y estructuras', flip: true,
      text: 'Tijerales, columnas y correas calculados para tu luz. Techamos cocheras, patios, almacenes y talleres con aluzinc, calamina o policarbonato.',
      label: 'Techo metálico con tijeral armándose con soldadura',
      steps: ['Columnas y cuerda inferior', 'Armado del tijeral', 'Soldadura de nudos', 'Correas', 'Cobertura de calamina'],
    },
  ];

  servicios: Servicio[] = [
    { tag: 'Estructural', icon: 'M4 40 L24 10 L44 40 Z M24 10v30M14 25l10 15M34 25L24 40', titulo: 'Estructuras metálicas', texto: 'Diseño, fabricación y montaje de estructuras de acero para viviendas, almacenes y obras, con resistencia y seguridad garantizadas.' },
    { tag: 'Electrodo · arco', icon: 'M8 40 L26 22 M24 16 l8 8 l-4 4 l-8 -8 z M36 4v3M36 17v3M28 12h3M41 12h3', titulo: 'Soldadura industrial', texto: 'Soldadura por arco con electrodo para estructuras y trabajos de gran escala.' },
    { tag: 'Seguridad', icon: 'M10 4h28v40H10z M10 22h28M17 4v18M24 4v18M31 4v18', titulo: 'Herrería y portones', texto: 'Puertas, rejas, barandas y escaleras con diseño propio.' },
    { tag: 'A medida', icon: 'M6 20h36M10 20v20M38 20v20M6 14h36M18 14c0-6 12-6 12 0', titulo: 'Mobiliario personalizado', texto: 'Muebles de metal con madera, vidrio u otros materiales.' },
    { tag: 'Precisión', icon: 'M6 34h24l12 -12M6 26h20M34 8l6 6M30 12l6 6', titulo: 'Corte y doblado', texto: 'Planchas y perfiles cortados y doblados con exactitud.' },
    { tag: 'Soporte', icon: 'M30 6a10 10 0 0 0-9 14L6 35l7 7 15-15a10 10 0 0 0 14-9l-6 6-6-2-2-6z', titulo: 'Mantenimiento y reparación', texto: 'Reparamos y reforzamos estructuras para alargar su vida útil.' },
  ];

  pasos: Paso[] = [
    { titulo: 'Visita y medidas', texto: 'Vamos a tu obra o nos traes tus medidas al taller. Conversamos qué necesitas y cómo lo vas a usar.' },
    { titulo: 'Diseño y cotización', texto: 'Te proponemos el diseño, el material y el precio claro, sin compromiso.' },
    { titulo: 'Fabricación', texto: 'Cortamos, armamos y soldamos en el taller con controles en cada etapa.' },
    { titulo: 'Instalación', texto: 'Llevamos e instalamos el trabajo, y lo dejamos listo para usar o pintar.' },
  ];

  testimonios: Testimonio[] = [
    { foto: 'assets/img/cliente2.webp', texto: 'Su profesionalismo y atención al detalle superaron mis expectativas. El resultado fue impecable, como el metal más puro.', autor: 'Carlos M.' },
    { foto: 'assets/img/cliente1.webp', texto: '¡Un trabajo excelente! La calidad es notoria y el trato fue muy amable desde el principio, cumpliendo los plazos.', autor: 'Ana R.' },
    { foto: 'assets/img/cliente2.webp', texto: 'Totalmente recomendado. La obra se entregó a tiempo y con la mejor calidad en los acabados.', autor: 'Javier L.' },
    { foto: 'assets/img/cliente1.webp', texto: 'Me encantó el diseño y la durabilidad de los productos. Sin duda volveré a contratarlos.', autor: 'Sofía P.' },
  ];

  constructor(private fx: WeldFxService, private host: ElementRef<HTMLElement>, private zone: NgZone) {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.init()));
  }

  private init(): void {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.fx.heroAnchor = this.heroArc().nativeElement;
    this.initReveal();
    this.initSpotlight();
    this.initForge(reduceMotion);
    if (!reduceMotion) {
      this.initHeroWelding();
      this.initProcessRail();
      this.initCounters();
    }
  }

  /** Estructura 3D del inicio (three.js se descarga solo en el navegador) */
  private initForge(reduceMotion: boolean): void {
    let disposed = false;
    let dispose: (() => void) | null = null;
    const status = this.status3d().nativeElement;
    // Se descarga cuando la página ya se mostró y el navegador está libre: la carga inicial queda liviana
    const start = () => import('../../shared/forge-3d/forge-scene').then(({ createForge }) => {
      if (disposed) return;
      try {
        dispose = createForge(this.stage3d().nativeElement, {
          reduceMotion,
          onStatus: text => { if (status.textContent !== text) status.textContent = text; },
        }).dispose;
        this.hero().nativeElement.classList.add('has-3d');
      } catch {
        // Sin WebGL: queda el fondo de rejilla
      }
    });
    const idle = (fn: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 300));
    if (document.readyState === 'complete') idle(start);
    else addEventListener('load', () => idle(start), { once: true });
    this.cleanup.push(() => { disposed = true; dispose?.(); });
  }

  /** Aparición suave de tarjetas y bloques */
  private initReveal(): void {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    this.host.nativeElement.querySelectorAll('.reveal').forEach(el => io.observe(el));
    this.cleanup.push(() => io.disconnect());
  }

  /** Las cifras cuentan desde cero al aparecer */
  private initCounters(): void {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target as HTMLElement;
      const m = /^(\d+)(.*)$/.exec(el.textContent ?? '');
      if (!m) return;
      const end = +m[1], suffix = m[2], t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }), { threshold: 0.6 });
    this.host.nativeElement.querySelectorAll('.stat b').forEach(el => io.observe(el));
    this.cleanup.push(() => io.disconnect());
  }

  /** Luz del arco que sigue al puntero sobre las tarjetas de servicios */
  private initSpotlight(): void {
    const grid = this.host.nativeElement.querySelector<HTMLElement>('.bento');
    if (!grid) return;
    const move = (e: PointerEvent) => {
      grid.querySelectorAll<HTMLElement>('.bento__card').forEach(card => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    grid.addEventListener('pointermove', move);
    this.cleanup.push(() => grid.removeEventListener('pointermove', move));
  }

  /** El visitante suelda en el inicio: mantener presionado y arrastrar deja un cordón que se enfría */
  private initHeroWelding(): void {
    const hero = this.hero().nativeElement;
    const canvas = this.trail().nativeElement;
    const coords = this.coords().nativeElement;
    const ctx = canvas.getContext('2d')!;
    const dots: BeadDot[] = [];
    let pressed = false;
    let last: { x: number; y: number } | null = null;
    let lastClient = { x: 0, y: 0 };
    let raf = 0;
    let W = 0, H = 0;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const addTo = (x: number, y: number) => {
      const now = performance.now();
      if (last) {
        const d = Math.hypot(x - last.x, y - last.y);
        const n = Math.floor(d / 3);
        for (let i = 1; i <= n; i++) {
          dots.push({ x: last.x + (x - last.x) * i / n, y: last.y + (y - last.y) * i / n, t: now, r: 3.6 + Math.random() * 1.6 });
        }
        if (n === 0) return;
      } else {
        dots.push({ x, y, t: now, r: 4.2 });
      }
      last = { x, y };
      if (dots.length > 2500) dots.splice(0, dots.length - 2500);
    };

    // blanco → naranja → acero, y se desvanece a los 9 s
    const colorFor = (age: number): [string, number] => {
      const alpha = age > 9000 ? Math.max(0, 1 - (age - 9000) / 2000) : 1;
      if (age < 250) return ['#fff4c8', alpha];
      if (age < 1400) return ['#ff8a1e', alpha];
      if (age < 2600) return ['#b0582a', alpha];
      return ['#77716a', alpha];
    };

    const draw = () => {
      raf = 0;
      ctx.clearRect(0, 0, W, H);
      const now = performance.now();
      while (dots.length && now - dots[0].t > 11000) dots.shift();
      for (const d of dots) {
        const age = now - d.t;
        const [c, a] = colorFor(age);
        ctx.globalAlpha = a;
        if (age < 1400) {
          ctx.fillStyle = 'rgba(255,120,20,.25)';
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 2.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = .7; ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (pressed) this.fx.weldAt(lastClient.x, lastClient.y);
      if (dots.length || pressed) raf = requestAnimationFrame(draw);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const local = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const interactive = (e: PointerEvent) => !(e.target as HTMLElement).closest('a, button');
    const down = (e: PointerEvent) => {
      if (!interactive(e) || e.button > 0) return;
      pressed = true; last = null;
      lastClient = { x: e.clientX, y: e.clientY };
      const p = local(e); addTo(p.x, p.y);
      hero.classList.add('is-welding');
      kick();
    };
    const move = (e: PointerEvent) => {
      const p = local(e);
      coords.textContent = `X ${String(Math.round(p.x)).padStart(4, '0')} · Y ${String(Math.round(p.y)).padStart(4, '0')}`;
      if (!pressed) return;
      lastClient = { x: e.clientX, y: e.clientY };
      addTo(p.x, p.y);
    };
    const up = () => { pressed = false; last = null; hero.classList.remove('is-welding'); };

    hero.addEventListener('pointerdown', down);
    hero.addEventListener('pointermove', move);
    addEventListener('pointerup', up);
    hero.addEventListener('pointercancel', up);
    addEventListener('resize', resize);

    // Demostración: al cargar, un cordón se suelda solo bajo el título
    const line = this.demoLine().nativeElement;
    const demo = { p: 0 };
    let demoLast = -1;
    const tween = gsap.to(demo, {
      p: 1, duration: 2.4, delay: 1.1, ease: 'none',
      onUpdate: () => {
        const hr = hero.getBoundingClientRect();
        const lr = line.getBoundingClientRect();
        const x = lr.left - hr.left + lr.width * demo.p;
        const y = lr.top - hr.top + Math.sin(demo.p * 40) * 1.2;
        if (demoLast < 0) last = null;
        demoLast = demo.p;
        addTo(x, y);
        if (demo.p < 1) this.fx.weldAt(hr.left + x, hr.top + y);
        kick();
      },
      onComplete: () => { last = null; },
    });

    this.cleanup.push(() => {
      tween.kill();
      cancelAnimationFrame(raf);
      hero.removeEventListener('pointerdown', down);
      hero.removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      hero.removeEventListener('pointercancel', up);
      removeEventListener('resize', resize);
    });
  }

  /** Línea del proceso: un cordón que avanza al bajar */
  private initProcessRail(): void {
    gsap.registerPlugin(ScrollTrigger);
    const rail = this.rail().nativeElement;
    const tween = gsap.fromTo(rail, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: rail.parentElement, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 },
    });
    this.cleanup.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });
  }

  irAlTaller(): void {
    document.getElementById('taller')?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.fx.heroAnchor = null;
    this.cleanup.forEach(fn => fn());
  }
}
