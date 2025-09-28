import { NgClass } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-header',
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  // Propiedad para controlar la visibilidad del menú móvil
  menuOpen = false;

  // Función para alternar el estado del menú
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  // Escuchamos el evento de redimensionamiento de la ventana para cerrar el menú
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth > 768) {
      this.menuOpen = false;
    }
  }
  
}
