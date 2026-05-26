import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-soporte-tecnico',
  templateUrl: './soporte-tecnico.page.html',
  styleUrls: ['./soporte-tecnico.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SoporteTecnicoPage {

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

  constructor(private router: Router) {}

  volverLogin() {
    this.router.navigate(['/iniciar-sesion']);
  }

  buscarAlumno() {

    // Simulated database lookup
    const mockStudents: any = {
      '202400123': {
        name: 'Juan Pérez García',
        birthDate: '2012-05-14'
      },

      '202400456': {
        name: 'María González López',
        birthDate: '2011-09-22'
      }
    };

    const student = mockStudents[this.studentId];

    if (student) {

      this.studentName = student.name;
      this.birthDate = student.birthDate;

      this.studentFound = true;

    } else {

      this.studentFound = false;

      alert('No se encontró información para esta matrícula.');

    }
  }

  onFileSelected(event: any) {

    if (event.target.files) {
      this.selectedFiles = Array.from(event.target.files);
    }
  }

  generarTicket(): string {

    const random = Math.floor(100000 + Math.random() * 900000);

    return `TKT-${random}`;
  }

  enviarSoporte() {

    this.generatedTicket = this.generarTicket();

    const soporteData = {
      ticket: this.generatedTicket,
      studentId: this.studentId,
      studentName: this.studentName,
      birthDate: this.birthDate,
      registrationCode: this.registrationCode,
      subject: this.subject,
      issueDescription: this.issueDescription,
      files: this.selectedFiles
    };

    console.log('Solicitud enviada:', soporteData);

    // Here you can later connect:
    // Firebase
    // Supabase
    // Node.js API
    // SQL Backend

    this.ticketSubmitted = true;
  }
}