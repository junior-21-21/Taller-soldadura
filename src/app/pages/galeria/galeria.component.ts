import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterModule } from '@angular/router';

// Interfaz para definir la estructura de un proyecto
interface Proyecto {
  id: number; // ID único para la función trackBy
  categoria: 'Estructuras' | 'Mobiliario' | 'Herrería Artística' | 'Reparaciones';
  titulo: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [RouterModule, NgFor],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent implements OnInit {

  // Array con todos los proyectos (la fuente de datos maestra)
  private todosLosProyectos: Proyecto[] = [
    { id: 1, categoria: 'Estructuras', titulo: 'Estructura Reforzada (Almacén)', descripcion: 'Acero reforzado para un nuevo almacén industrial, diseñada para durar décadas.', imagen: 'https://placehold.co/400x250/222222/E53935?text=Estructura+Industrial' },
    { id: 2, categoria: 'Herrería Artística', titulo: 'Baranda Forjada Elegante', descripcion: 'Elegante baranda de metal forjado, hecha a medida para una residencia.', imagen: 'https://placehold.co/400x250/444444/E53935?text=Baranda+Artística' },
    { id: 3, categoria: 'Herrería Artística', titulo: 'Puerta de Acceso Moderna', descripcion: 'Diseño minimalista de puerta principal con máxima seguridad y elegancia.', imagen: 'https://placehold.co/400x250/111111/E53935?text=Puerta+Moderna' },
    { id: 4, categoria: 'Mobiliario', titulo: 'Mesa Industrial de Comedor', descripcion: 'Mesa de comedor con base de metal única, combinando resistencia y diseño.', imagen: 'https://placehold.co/400x250/2c2c2c/E53935?text=Mobiliario+Industrial' },
    { id: 5, categoria: 'Reparaciones', titulo: 'Rehabilitación de Fachada', descripcion: 'Reparación y refuerzo estructural de una antigua fachada metálica.', imagen: 'https://placehold.co/400x250/333333/E53935?text=Reparación+Fachada' },
    { id: 6, categoria: 'Herrería Artística', titulo: 'Escultura Metálica Abstracta', descripcion: 'Pieza de arte abstracto creada con soldadura de precisión y creatividad.', imagen: 'https://placehold.co/400x250/555555/E53935?text=Arte+en+Metal' }
  ];

  // Este array contendrá los proyectos que se muestran en la UI.
  proyectosFiltrados: Proyecto[] = [];
  
  // Guarda el nombre del filtro activo para el estilo del botón.
  filtroActivo: string = 'Todos';

  constructor() { }

  ngOnInit(): void {
    // Al iniciar el componente, mostramos todos los proyectos por defecto.
    this.proyectosFiltrados = this.todosLosProyectos;
  }

  /**
   * Filtra los proyectos según la categoría seleccionada en la UI.
   * @param categoria La categoría por la cual filtrar ('Todos', 'Estructuras', etc.).
   */
  filtrarProyectos(categoria: string): void {
    this.filtroActivo = categoria;
    
    if (categoria === 'Todos') {
      this.proyectosFiltrados = this.todosLosProyectos;
    } else {
      this.proyectosFiltrados = this.todosLosProyectos.filter(
        proyecto => proyecto.categoria === categoria
      );
    }
  }

  /**
   * Maneja el evento de click en una tarjeta. 
   * @param proyectoSeleccionado El objeto Proyecto en el que se hizo click.
   */
  verDetalles(proyectoSeleccionado: Proyecto): void {
    // Aquí puedes implementar la lógica para abrir un modal, navegar a una página de detalles, etc.
    console.log(`Viendo detalles del proyecto: ${proyectoSeleccionado.titulo}`);
    // Ejemplo: alert(`Viendo detalles de: ${proyectoSeleccionado.titulo}`);
  }

  /**
   * Función para optimizar el rendimiento del bucle *ngFor.
   * Ayuda a Angular a no destruir y recrear todos los elementos de la lista al filtrar.
   */
  trackById(index: number, proyecto: Proyecto): number {
    return proyecto.id;
  }
}