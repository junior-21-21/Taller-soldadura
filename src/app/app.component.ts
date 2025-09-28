import { Component, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common'; // Importamos la utilidad para verificar la plataforma
import { Router, RouterOutlet, NavigationEnd } from '@angular/router'; // Importamos Router y NavigationEnd
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { filter } from 'rxjs/operators'; // Importamos 'filter' de RxJS

@Component({
  selector: 'app-root',
  standalone: true, // Asumiendo que es un componente standalone por la estructura de imports
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'taller-soldadura';

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
        }
      });
  }
}
