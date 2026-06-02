import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

import { ApiService } from '../../services/api';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-soporte-tecnico',
  templateUrl: './soporte-tecnico.page.html',
  styleUrls: ['./soporte-tecnico.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SoporteTecnicoPage {

  role: 'padre' | 'docente' = 'padre';

  studentId: string = '';
  studentName: string = '';
  birthDate: string = '';

  registrationCode: string = '';
  subject: string = '';
  issueDescription: string = '';

  studentFound: boolean = false;

  selectedFiles: File[] = [];

  ticketSubmitted: boolean = false;
  generatedTicket: string = '';

  isSubmitting: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private api: ApiService
  ) {}

  volverLogin() {
    this.router.navigate(['/iniciar-sesion']);
  }

  async buscarAlumno() {
  try {
    this.isSubmitting = true;

    const res: any = await this.api.validateAlumno({
      studentId: this.studentId,
      registrationCode: this.registrationCode
    });

    if (!res?.success) {
      this.studentFound = false;
      alert(res?.error?.message || 'No encontrado');
      return;
    }

    this.studentName = res.alumno.nombre_completo;
    this.birthDate = res.alumno.fecha_nacimiento;
    this.studentFound = true;

  } catch (err) {
    console.error(err);
    alert('Error validando alumno');
  } finally {
    this.isSubmitting = false;
  }
}

async validarDocente() {
  return await this.api.validateDocente({
    docenteId: this.studentId,
    registrationCode: this.registrationCode
  });
}

onFileSelected(event: any) {
  if (event.target.files) {
    this.selectedFiles = Array.from(event.target.files);
  }
}

  generarTicket(): string {

    const random =
      Math.floor(100000 + Math.random() * 900000);

    return `TKT-${random}`;
  }

  async enviarSoporte() {

  this.isSubmitting = true;

  try {

    const currentUser = await this.authService.getProfile();

    if (!currentUser) {
      alert('Usuario no autenticado');
      return;
    }

    let validationResult: any;

    // =====================
    // ROLE-BASED VALIDATION
    // =====================

    if (currentUser.rol_id === 3) {

      validationResult = await this.api.validateAlumno({
        studentId: this.studentId,
        registrationCode: this.registrationCode
      });
    }

    if (currentUser.rol_id === 2) {

      validationResult = await this.api.validateDocente({
        docenteId: this.studentId,
        registrationCode: this.registrationCode
      });
    }

    if (currentUser.rol_id === 1) {
      validationResult = { success: true };
    }

    if (!validationResult?.success) {
      alert(validationResult?.error?.message || 'Validación fallida');
      return;
    }

    // =====================
    // CREATE TICKET VIA API
    // =====================

    const ticketPayload = {
      usuarioId: currentUser.id,
      alumnoMatricula: this.studentId,
      codigoRegistro: this.registrationCode,
      asunto: this.subject,
      descripcion: this.issueDescription,
      files: this.selectedFiles
    };

    const res: any = await this.api.createTicket(ticketPayload);

    if (!res?.success) {
      alert('Error creando ticket');
      return;
    }

    this.generatedTicket = res.ticket_codigo;
    this.ticketSubmitted = true;

  } catch (err) {
    console.error(err);
    alert('Error enviando ticket');

  } finally {
    this.isSubmitting = false;
  }
}
}