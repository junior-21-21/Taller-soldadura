import { Component, ElementRef, NgZone, OnDestroy, afterNextRender, input, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WeldFxService } from '../weld-fx/weld-fx.service';
import { Director, SceneName, builders, ensureDefs } from './scenes';

// Recalcula posiciones una vez que todas las escenas, imágenes y fuentes están listas
let refreshQueued = false;
function scheduleRefresh(): void {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
  if (document.readyState !== 'complete') addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

@Component({
  selector: 'app-build-scene',
  templateUrl: './build-scene.component.html',
  styleUrl: './build-scene.component.css',
  host: { '[class.flip]': 'flip()' }
})
export class BuildSceneComponent implements OnDestroy {
  scene = input.required<SceneName>();
  num = input.required<string>();
  heading = input.required<string>();
  text = input.required<string>();
  steps = input.required<string[]>();
  label = input.required<string>();
  flip = input(false);

  private section = viewChild.required<ElementRef<HTMLElement>>('section');
  private stage = viewChild.required<ElementRef<SVGSVGElement>>('stage');
  private trigger: ScrollTrigger | null = null;
  private director: Director | null = null;

  constructor(private fx: WeldFxService, private zone: NgZone) {
    afterNextRender(() => this.zone.runOutsideAngular(() => this.build()));
  }

  private build(): void {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.registerPlugin(ScrollTrigger);
    ensureDefs();
    const section = this.section().nativeElement;
    const svg = this.stage().nativeElement;
    this.director = new Director(svg, !reduceMotion, (x, y) => this.fx.weldAt(x, y));
    builders[this.scene()](this.director);
    const steps = Array.from(section.querySelectorAll<HTMLElement>('.steps li'));
    this.trigger = this.director.attach(section, steps);
    scheduleRefresh();
  }

  ngOnDestroy(): void {
    this.trigger?.kill(true);
    this.director?.tl?.kill();
  }
}
