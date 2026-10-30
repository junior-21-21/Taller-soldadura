import { Routes,RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';


export const routes: Routes = [
   { path: '', component: HomeComponent },
  { path: 'servicios', loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent) },
  { path: 'equipo', loadComponent: () => import('./pages/equipo/equipo.component').then(m => m.EquipoComponent) },
  { path: 'contacto', loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent) }, 
  { path: 'galeria', loadComponent: () => import('./pages/galeria/galeria.component').then(m => m.GaleriaComponent) },
  { path: 'puertas', loadComponent: () => import('./pages/puertas/puertas.component').then(m => m.PuertasComponent) }
];


@NgModule({
  imports: [
    // Aquí es donde aplicas la configuración:
    RouterModule.forRoot(routes, {
      // Habilita la restauración de la posición de desplazamiento, forzando el scroll al tope
      // en navegaciones normales (solo restaura posición en botón de atrás/adelante del navegador).
      scrollPositionRestoration: 'enabled', 
      
      // Asegura que los fragmentos de URL (ej: /page#section) funcionen correctamente. 
      // A menudo necesario para estabilizar el comportamiento de scroll.
      anchorScrolling: 'enabled'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }