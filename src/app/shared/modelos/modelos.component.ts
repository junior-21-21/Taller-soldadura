import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Categoria = 'puertas' | 'ventanas' | 'mesas';

interface Modelo {
  id: string;
  nombre: string;
  detalle: string;
  acabados: string[];
}

/** Catálogo de modelos modernos con dibujos propios (SVG, sin fotos pesadas) */
@Component({
  selector: 'app-modelos',
  imports: [RouterLink],
  templateUrl: './modelos.component.html',
  styleUrl: './modelos.component.css',
})
export class ModelosComponent {
  categoria = signal<Categoria>('puertas');

  readonly categorias: { id: Categoria; nombre: string }[] = [
    { id: 'puertas', nombre: 'Puertas' },
    { id: 'ventanas', nombre: 'Ventanas' },
    { id: 'mesas', nombre: 'Mesas' },
  ];

  readonly modelos: Record<Categoria, Modelo[]> = {
    puertas: [
      { id: 'p-madera', nombre: 'Nogal horizontal', detalle: 'Paneles acabado madera con bruñas y jalador largo de acero inoxidable.', acabados: ['Acabado madera', 'Jalador inox'] },
      { id: 'p-grafito', nombre: 'Grafito con espejo', detalle: 'Hoja gris grafito con franja de acero espejo y líneas inox.', acabados: ['Grafito', 'Acero espejo'] },
      { id: 'p-pivot', nombre: 'Madera y visor', detalle: 'Listones verticales acabado madera con visor de vidrio esmerilado.', acabados: ['Acabado madera', 'Vidrio'] },
    ],
    ventanas: [
      { id: 'v-escalonada', nombre: 'Reja escalonada', detalle: 'Barras horizontales alternadas entre dos parantes, en grafito.', acabados: ['Grafito', 'Tubo 1"'] },
      { id: 'v-lineas', nombre: 'Líneas verticales', detalle: 'Barras verticales a distinto ritmo con rectángulos, estilo moderno.', acabados: ['Gris perla', 'Platina'] },
      { id: 'v-batiente', nombre: 'Batiente con cuadrícula', detalle: 'Dos hojas que abren, con cuadrícula irregular y vidrio.', acabados: ['Negro mate', 'Vidrio'] },
    ],
    mesas: [
      { id: 'm-trapecio', nombre: 'Comedor trapecio', detalle: 'Patas trapecio de tubo negro y tablero grueso de madera.', acabados: ['Negro mate', 'Madera'] },
      { id: 'm-u', nombre: 'Centro patas U', detalle: 'Mesa de centro baja con patas en U y tablero rústico.', acabados: ['Negro mate', 'Madera rústica'] },
      { id: 'm-barra', nombre: 'Barra alta', detalle: 'Barra para cocina o negocio con reposapiés de acero.', acabados: ['Negro mate', 'Madera'] },
    ],
  };

  whatsapp(m: Modelo): string {
    const texto = `Hola Run Run, quiero cotizar el modelo "${m.nombre}" (${this.categoria()}). Mis medidas son: `;
    return 'https://wa.me/51900048717?text=' + encodeURIComponent(texto);
  }
}
