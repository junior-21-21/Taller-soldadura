import { Injectable } from '@angular/core';

/**
 * Estado compartido del arco de soldadura.
 * Las escenas avisan dónde está soldando el electrodo y el componente
 * WeldFx dibuja el arco, el destello y las chispas en ese punto.
 */
@Injectable({ providedIn: 'root' })
export class WeldFxService {
  arc = { x: 0, y: 0, t: -1e9 };
  /** Punto del logo del hero que suelta chispas mientras está a la vista */
  heroAnchor: HTMLElement | null = null;

  weldAt(x: number, y: number): void {
    this.arc.x = x;
    this.arc.y = y;
    this.arc.t = performance.now();
  }
}
