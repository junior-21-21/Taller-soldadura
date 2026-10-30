import { Component, signal } from '@angular/core';

/** Intro con el logo: sale cada vez que se abre o recarga la página. Es CSS puro, así que funciona aunque JS tarde en cargar. */
@Component({
  selector: 'app-intro',
  standalone: true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent {
  saltada = signal(false);
  chispas = Array.from({ length: 14 }, (_, i) => ({
    dx: Math.round(Math.cos(i * 0.9) * (40 + (i * 37) % 60)),
    dy: Math.round(-30 - (i * 53) % 70),
    d: (i % 5) * 0.12
  }));
}
