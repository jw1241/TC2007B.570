import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { SoporteTicket } from '../../services/support';

@Component({
  selector: 'app-inicio-admin',
  templateUrl: './inicio-resumen-administrador.page.html',
  styleUrls: ['./inicio-resumen-administrador.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class InicioResumenAdministradorPage implements OnInit {

  tickets: SoporteTicket[] = [];
  isLoading = false;
  selectedTicketId: string | null = null;

  previewFileUrl: string | null = null;
  previewOpen = false;

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadTickets();
  }

  async loadTickets() {
    this.isLoading = true;

    try {
      const res = await this.api.get<any[]>(
        '/admin/tickets/recent-with-files'
      );

      // IMPORTANT: normalize shape
      this.tickets = (res ?? []).map(t => ({
  id: t.id,
  ticket_codigo: t.ticket_codigo,
  asunto: t.asunto,
  estado: t.estado,
  creado_en: t.creado_en,
  descripcion: t.descripcion,

  estudiante_nombre: t.estudiante_nombre,
  fecha_nacimiento: t.fecha_nacimiento,
  matricula: t.matricula,
  role: t.role,

  soporte_archivos: t.soporte_archivos ?? []
}));

    } catch (err) {
      console.error('Error loading tickets', err);
    } finally {
      this.isLoading = false;
    }
  }

  toggleTicket(ticketId: string) {
    this.selectedTicketId =
      this.selectedTicketId === ticketId ? null : ticketId;
  }

  isOpen(ticketId: string) {
    return this.selectedTicketId === ticketId;
  }

  openFile(url: string) {
  this.previewFileUrl = url;
  this.previewOpen = true;
}
closePreview() {
  this.previewOpen = false;
  this.previewFileUrl = null;
}
}