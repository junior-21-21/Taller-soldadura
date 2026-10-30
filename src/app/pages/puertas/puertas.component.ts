import { Component, computed, signal } from '@angular/core';
import { ESTILOS, Estilo, PUERTAS, Puerta } from './puertas.data';

@Component({
  selector: 'app-puertas',
  standalone: true,
  templateUrl: './puertas.component.html',
  styleUrl: './puertas.component.css'
})
export class PuertasComponent {
  estilos = ESTILOS;
  estilo = signal<Estilo | 'todas'>('todas');
  orden = signal<'catalogo' | 'menor' | 'mayor'>('catalogo');
  abierta = signal<Puerta | null>(null);

  lista = computed(() => {
    const e = this.estilo();
    const l = e === 'todas' ? [...PUERTAS] : PUERTAS.filter(p => p.estilos.includes(e));
    const o = this.orden();
    if (o !== 'catalogo') l.sort((a, b) => ((a.precio ?? 1e9) - (b.precio ?? 1e9)) * (o === 'menor' ? 1 : -1));
    return l;
  });

  precio(p: Puerta): string {
    return p.precio === null ? 'Según medida' : 'S/ ' + p.precio.toLocaleString('en-US');
  }

  whatsapp(p: Puerta): string {
    const texto = `Hola Run Run, me interesa la puerta ${p.codigo} (${p.nombre}). ¿Me pueden cotizar?`;
    return 'https://wa.me/51930929558?text=' + encodeURIComponent(texto);
  }
}
