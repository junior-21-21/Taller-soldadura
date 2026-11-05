import { Component, computed, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ESTILOS, Estilo, PUERTAS, Puerta } from '../puertas/puertas.data';

/** Galería con fotos reales de trabajos del taller (las del catálogo de puertas) */
@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css']
})
export class GaleriaComponent {
  // Una selección variada: madera, negro, blanco, vidrio, inox, arco, pivotante y reja
  private readonly destacados = ['pm05', 'pm46', 'pm31', 'pm44', 'pm45', 'pm58', 'pm29', 'pm33', 'pm49', 'pm65', 'pm69', 'pm73', 'pm40', 'pm54', 'pm60', 'pm71'];
  private readonly trabajos = this.destacados.map(id => PUERTAS.find(p => p.img === id)!).filter(Boolean);

  filtros = ESTILOS.filter(e => e.id !== 'claro');
  filtro = signal<Estilo | 'todas'>('todas');
  abierta = signal<Puerta | null>(null);

  visibles = computed(() => {
    const f = this.filtro();
    return f === 'todas' ? this.trabajos : this.trabajos.filter(p => p.estilos.includes(f));
  });
}
