import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';

@Component({
  selector: 'app-parent-mensajes',
  templateUrl: './parent-mensajes.page.html',
  styleUrls: ['./parent-mensajes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ParentMensajesPage implements OnInit {

  // STEP 1
  students: any[] = [];
  selectedStudent: any = null;

  // STEP 2
  teachers: any[] = [];
  selectedTeacher: any = null;

  // CHAT
  mensajes: any[] = [];
  mensajeTexto = '';

  currentUserId!: string;

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
  const me = await this.api.get<any>('/auth/me');
  this.currentUserId = me?.data?.id ?? me?.id ?? me?.user?.id;
  await this.loadStudents();
}

  async loadStudents() {
  const res = await this.api.get<any>('/mensajes/contactos');
  this.students = res.data || [];
}

  // STEP 1: select student
  async selectStudent(student: any) {
    this.selectedStudent = student;
    this.selectedTeacher = null;
    this.mensajes = [];

    const res = await this.api.get<any>(
      `/mensajes/alumno/${student.id}/teachers`
    );

    this.teachers = res.data || [];
  }

  // STEP 2: select teacher
  async selectTeacher(teacher: any) {
  this.selectedTeacher = teacher;

  const chat = await this.api.get<any>(
    `/mensajes/chat/${this.selectedStudent.id}/${teacher.id}`
  );

const payload = chat?.data;

this.mensajes =
  Array.isArray(payload) ? payload :
  payload?.mensajes ? payload.mensajes :
  [];
}

  backToStudents() {
    this.selectedStudent = null;
    this.selectedTeacher = null;
    this.teachers = [];
    this.mensajes = [];
    this.mensajeTexto = '';
  }

  backToTeachers() {
    this.selectedTeacher = null;
    this.mensajes = [];
    this.mensajeTexto = '';
  }

  // SEND MESSAGE
  async sendMessage() {
  if (!this.mensajeTexto.trim() || !this.selectedTeacher) return;

  await this.api.post('/mensajes/enviar', {
    alumno_id: this.selectedStudent.id,
    docente_id: this.selectedTeacher.id,
    contenido: this.mensajeTexto
  });

  this.mensajeTexto = '';

  const chat = await this.api.get<any>(
  `/mensajes/chat/${this.selectedStudent.id}/${this.selectedTeacher.id}`
);

const payload = chat?.data;

this.mensajes =
  Array.isArray(payload) ? payload :
  payload?.mensajes ? payload.mensajes :
  [];
}
  navigateTo(path: string) {

    this.router.navigate([
      path
    ]);

  }
}