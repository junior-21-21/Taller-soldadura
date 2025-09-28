import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface MiembroEquipo {
  nombre: string;
  especialidad: string;
  descripcion: string; // Breve descripción o lema
  celular: string; // Número de celular, se usará para el enlace de WhatsApp y llamada
  email: string;
  imagen: string; // Ruta a la foto del trabajador (ej: 'assets/images/juan.jpg')
  linkedin?: string; // Opcional: para añadir redes sociales
}

interface ValorTaller {
  icon: string; // Nombre del icono de Material Icons
  titulo: string;
  descripcion: string;
}

@Component({
  selector: 'app-equipo',
  standalone: true, // Asegúrate de que tu componente es standalone
  imports: [NgFor, NgIf, RouterModule],
  templateUrl: './equipo.component.html',
  styleUrl: './equipo.component.css'
})
export class EquipoComponent implements OnInit {
  titulo = 'Conoce a los expertos detrás de cada soldadura';
  subtitulo = 'Nuestro equipo, nuestra fuerza.';
  lema = 'Forjamos confianza, soldadura a soldadura.';

  // --- Nueva Data: Valores y Filosofía ---
  filosofia: string = "Somos un equipo apasionado por el metal, la precisión y la seguridad. Cada uno aporta experiencia y dedicación para entregar un trabajo de calidad que supera las expectativas, manteniendo siempre la integridad y el compromiso con nuestros clientes.";

  valores: ValorTaller[] = [
    {
      icon: 'security',
      titulo: 'Seguridad Primero',
      descripcion: 'Priorizamos la seguridad en cada proceso y montaje.',
    },
    {
      icon: 'handyman',
      titulo: 'Experiencia Técnica',
      descripcion: 'Más de dos décadas de dominio en técnicas de soldadura avanzada.',
    },
    {
      icon: 'psychology',
      titulo: 'Innovación y Precisión',
      descripcion: 'Aplicamos soluciones creativas con la máxima exactitud.',
    },
    {
      icon: 'diversity_3',
      titulo: 'Trabajo en Equipo',
      descripcion: 'Colaboración constante para resultados impecables.',
    },
    {
      icon: 'support_agent',
      titulo: 'Atención al Cliente',
      descripcion: 'Comprometidos con la satisfacción y confianza de nuestros clientes.',
    }
  ];
  // ----------------------------------------

  // NOTA: Asegúrate de que el 'celular' en la data contenga el código de país para que el link de WhatsApp funcione correctamente.
  equipo: MiembroEquipo[] = [
    {
      nombre: 'Juan Pérez',
      especialidad: 'Fundador y Maestro Soldador',
      descripcion: 'Más de 20 años de experiencia en estructuras metálicas complejas, liderando la calidad.',
      // Ejemplo: usar formato de solo números, incluyendo el código de país (ej. 52 para México, 54 para Argentina)
      celular: '521999888777', 
      email: 'juan.perez@metalurgia.com',
      imagen: 'https://via.placeholder.com/300x250/333333/FFFFFF?text=J.Perez'
    },
    {
      nombre: 'María Gómez',
      especialidad: 'Diseño CAD/CAM y Control de Calidad',
      descripcion: 'Garantiza la precisión milimétrica, transformando planos en realidad metálica.',
      celular: '521999666555',
      email: 'maria.gomez@metalurgia.com',
      imagen: 'https://via.placeholder.com/300x250/E53935/FFFFFF?text=M.Gomez'
    },
    {
      nombre: 'Carlos Ruiz',
      especialidad: 'Técnico en Montaje e Instalación',
      descripcion: 'Experto en la logística y finalización de proyectos, cumpliendo plazos rigurosos.',
      celular: '521999444333',
      email: 'carlos.ruiz@metalurgia.com',
      imagen: 'https://via.placeholder.com/300x250/1A1919/FFFFFF?text=C.Ruiz',
      linkedin: 'https://www.linkedin.com/in/carlosruiz'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Limpia el número de celular para usarlo en el enlace de WhatsApp.
   * Elimina espacios, guiones, y paréntesis.
   * @param celular El número de celular (debe incluir código de país).
   * @returns El link de WhatsApp.
   */
  getWhatsappLink(celular: string): string {
    const numeroLimpio = celular ? celular.replace(/[\s\-\(\)]/g, '') : '';
    // Puedes añadir un texto predefinido usando '&text=Hola, quiero cotizar un servicio.'
    return `https://wa.me/${numeroLimpio}`;
  }
}
