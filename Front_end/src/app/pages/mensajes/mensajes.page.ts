import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from 'src/app/services/api';


@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.page.html',
  styleUrls: ['./mensajes.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class MensajesPage implements OnInit {

  contactos: any[] = [];

  selectedStudent: any = null;

  selectedParents: any[] = [];

  mensajes: any[] = [];

  mensajeTexto = '';

  currentUserId!: string;

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.loadContactos();

    const me = await this.api.get<any>('/auth/me');
    this.currentUserId = me?.user?.id || me?.data?.id;
  }

  async loadContactos() {
    const res = await this.api.get<any>('/mensajes/contactos');
    this.contactos = res.data || [];
  }

  // STEP 1
  async selectStudent(student: any) {
  this.selectedStudent = student;

  const parentsRes = await this.api.get<any>(
    `/mensajes/alumno/${student.id}/parent`
  );

  this.selectedParents = parentsRes.data || [];

  const chatRes = await this.api.get<any>(
    `/mensajes/chat/alumno/${student.id}`
  );

  this.mensajes = chatRes.data || [];
}

  // STEP 2
  async openChat(parentId: string) {
    const res = await this.api.get<any>(
      `/mensajes/chat/${parentId}`
    );

    this.mensajes = res.data.mensajes || [];
  }

  back() {
    this.selectedStudent = null;
    this.selectedParents = [];
    this.mensajes = [];
    this.mensajeTexto = '';
  }

  async sendMessage() {
  if (!this.mensajeTexto.trim() || !this.selectedStudent?.id) return;

  await this.api.post('/mensajes/enviar', {
    alumno_id: this.selectedStudent.id,
    contenido: this.mensajeTexto
  });

  this.mensajeTexto = '';

  const chatRes = await this.api.get<any>(
    `/mensajes/chat/alumno/${this.selectedStudent.id}`
  );

  this.mensajes = chatRes.data || [];
}
}
