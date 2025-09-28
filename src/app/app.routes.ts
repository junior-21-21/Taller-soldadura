import { Routes,RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './pages/home/home.component';
import { ServiciosComponent } from './pages/servicios/servicios.component';
import { EquipoComponent } from './pages/equipo/equipo.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { GaleriaComponent } from './pages/galeria/galeria.component';


export const routes: Routes = [
   { path: '', component: HomeComponent },
  { path: 'servicios', component: ServiciosComponent },
  { path: 'equipo', component: EquipoComponent },
  { path: 'contacto', component: ContactoComponent }, 
  { path: 'galeria', component: GaleriaComponent }  
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