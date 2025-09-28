import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  imports: [FormsModule,CommonModule],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
cotizacion = {
    nombre: '',
    servicio: '',
    detalles: '',
    telefono: ''
  };

  enviarWhatsApp() {
    const numeroWhatsApp = '51900048717'; // Reemplaza con tu número de WhatsApp
    
    const mensaje = `¡Hola! He llenado el formulario de su sitio web para solicitar una cotización.

*Datos del cliente:*
👤 Nombre: ${this.cotizacion.nombre}
📱 Teléfono: ${this.cotizacion.telefono}

*Detalles de la solicitud:*
🛠️ Servicio: ${this.cotizacion.servicio}
📝 Descripción: ${this.cotizacion.detalles || 'No se especificaron detalles.'}

Por favor, contáctenme para continuar con el proceso. ¡Muchas gracias!`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

    window.open(urlWhatsApp, '_blank');
  }
}
