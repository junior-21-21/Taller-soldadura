import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Importamos la utilidad para verificar la plataforma
import { Router, RouterOutlet, NavigationEnd } from '@angular/router'; // Importamos Router y NavigationEnd
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { WeldFxComponent } from './shared/weld-fx/weld-fx.component';
import { IntroComponent } from './shared/intro/intro.component';
import { filter } from 'rxjs/operators'; // Importamos 'filter' de RxJS

@Component({
  selector: 'app-root',
  standalone: true, // Asumiendo que es un componente standalone por la estructura de imports
  imports: [RouterOutlet, HeaderComponent, FooterComponent, WeldFxComponent, IntroComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'taller-soldadura';
  private titleObserver?: IntersectionObserver;

  // Constructor con inyección del Router y PLATFORM_ID
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // 1. Inyectamos la ID de la plataforma
  ) {
    // Solución forzada: Escucha los eventos del Router
    this.router.events
      .pipe(
        // Filtra solo el evento que indica que la navegación ha finalizado exitosamente
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        // 2. Ejecuta window.scrollTo(0, 0) SOLO si estamos en el navegador
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
          setTimeout(() => this.splitTitles(), 0);
        }
      });
  }

  /** Los títulos con fuego aparecen palabra por palabra al entrar en pantalla */
  private splitTitles(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.titleObserver ??= new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); this.titleObserver!.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll<HTMLElement>('.title-hot:not(.split)').forEach(el => {
      const words = (el.textContent ?? '').trim().split(/\s+/);
      el.textContent = '';
      words.forEach((w, i) => {
        const outer = document.createElement('span');
        outer.className = 'w';
        const inner = document.createElement('span');
        inner.textContent = w;
        inner.style.setProperty('--i', String(i));
        outer.appendChild(inner);
        el.append(outer, i < words.length - 1 ? ' ' : '');
      });
      el.classList.add('split');
      this.titleObserver!.observe(el);
    });
  }
}
