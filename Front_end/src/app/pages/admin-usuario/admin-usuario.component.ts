import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api';

type FileType = 'grupos' | 'alumnos' | 'materias' | 'profesores';

@Component({
  selector: 'app-admin-usuario',
  templateUrl: './admin-usuario.component.html',
  styleUrls: ['./admin-usuario.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ]
})
export class AdminImportPage implements OnInit {

  // =========================
  // DATA
  // =========================
  grupos: any[] = [];
  alumnos: any[] = [];
  materias: any[] = [];
  profesores: any[] = [];

  // =========================
  // FILE STATE
  // =========================
  fileNames: Record<FileType, string | null> = {
    grupos: null,
    alumnos: null,
    materias: null,
    profesores: null
  };

  pendingFiles: Record<FileType, File | null> = {
    grupos: null,
    alumnos: null,
    materias: null,
    profesores: null
  };

  isUploading = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  // =========================
  // INIT
  // =========================
  async ngOnInit() {
    await this.cargarTodo();
  }

  async cargarTodo() {
    this.grupos = await this.api.get('/admin-usuarios/grupos');
    this.alumnos = await this.api.get('/admin-usuarios/alumnos');
    this.materias = await this.api.get('/admin-usuarios/materias');
    this.profesores = await this.api.get('/admin-usuarios/profesores');
  }

  // =========================
  // FILE SELECT
  // =========================
  onFileSelected(event: any, type: FileType) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.pendingFiles[type] = file;
    this.fileNames[type] = file.name;
  }

  clearInput(type: FileType, input?: HTMLInputElement) {
  this.pendingFiles[type] = null;
  this.fileNames[type] = null;

  if (input) input.value = '';
}

  // =========================
  // UPLOAD
  // =========================
  async uploadFile(type: FileType, input?: HTMLInputElement) {

  const file = this.pendingFiles[type];

  if (!file) return;

  const endpointMap: Record<FileType, string> = {
    grupos: '/admin-usuarios/import/grupos',
    alumnos: '/admin-usuarios/import/alumnos',
    materias: '/admin-usuarios/import/materias',
    profesores: '/admin-usuarios/import/profesores'
  };

  const formData = new FormData();
  formData.append('file', file);

  this.isUploading = true;

  try {
    await this.api.upload(endpointMap[type], formData);

    console.log('UPLOAD SUCCESS:', type);

    await this.cargarTodo();

    this.clearInput(type, input);

  } catch (err) {
    console.error('UPLOAD FAILED:', err);

    // IMPORTANT: reset so UI doesn't get stuck
    this.clearInput(type, input);
  } finally {
    this.isUploading = false;
  }
}

  // =========================
  // NAVIGATION
  // =========================
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}