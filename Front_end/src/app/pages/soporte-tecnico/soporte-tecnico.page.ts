import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';


@Component({
  selector: 'app-soporte-tecnico',
  templateUrl: './soporte-tecnico.page.html',
  styleUrls: ['./soporte-tecnico.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SoporteTecnicoPage {

  @ViewChild('fileInput')
fileInput!: ElementRef<HTMLInputElement>;

  role: 'padre' | 'docente' = 'padre';

  studentId: string = '';
  birthDate: string = '';

  registrationCode: string = '';
  subject: string = '';
  issueDescription: string = '';

  selectedFiles: File[] = [];
  uploadedFiles: any[] = [];

  ticketSubmitted: boolean = false;
  generatedTicket: string = '';

  isSubmitting: boolean = false;
  
  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  volverLogin() {
    this.router.navigate(['/iniciar-sesion']);
  }

onFileSelected(event: any) {

  if (!event.target.files) return;

  const newFiles =
    Array.from(event.target.files) as File[];

  this.selectedFiles = [
    ...this.selectedFiles,
    ...newFiles
  ];

}

removeFile(index: number) {

  this.selectedFiles.splice(index, 1);

  if (this.selectedFiles.length === 0) {
    this.fileInput.nativeElement.value = '';
  }

}

async enviarSoporte() {

  try {

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append('role', this.role);
    formData.append('studentId', this.studentId);

    if (this.role === 'padre') {
      formData.append(
        'birthDate',
        this.birthDate
      );
    }

    formData.append(
      'subject',
      this.subject
    );

    formData.append(
      'description',
      this.issueDescription
    );

    // MULTIPLE FILES
    for (const file of this.selectedFiles) {

      formData.append(
        'files',
        file,
        file.name
      );

    }

    const res: any =
      await this.api.createTicket(
        formData
      );

    this.uploadedFiles =
  res.uploadedFiles || [];

    if (!res.success) {

      alert(
        'No fue posible enviar el ticket'
      );

      return;

    }

    this.generatedTicket =
      res.ticketCode;

    this.ticketSubmitted = true;

    this.selectedFiles = [];
if (this.fileInput) {
  this.fileInput.nativeElement.value = '';
}

    alert(
      `Ticket enviado exitosamente.\nCódigo: ${res.ticketCode}`
    );

  } catch (err) {

    console.error(err);

    alert(
      'No se pudo enviar el ticket, confirmarse sus credenciales'
    );

  } finally {

    this.isSubmitting = false;

  }

}

}