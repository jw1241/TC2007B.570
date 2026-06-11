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

  // =========================
  // MANUAL FORMS STATE
  // =========================
  showForm: Record<FileType, boolean> = {
    grupos: false,
    alumnos: false,
    materias: false,
    profesores: false
  };

  nuevoGrupo = { grado: null, seccion: '' };
  nuevaMateria = { nombre_materia: '', es_general: false };
  nuevoAlumno = { matricula: '', nombre_estudiante: '', nombre_padre: '', grado: null, seccion: '' };
  nuevoProfesor = { docente_id: '', nombre_completo: '', nombre_materia: '', grado: null, seccion: '' };

  isSubmitting: Record<FileType, boolean> = {
    grupos: false,
    alumnos: false,
    materias: false,
    profesores: false
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
  // MANUAL FORMS METHODS
  // =========================
  toggleForm(type: FileType) {
    this.showForm[type] = !this.showForm[type];
  }

  async submitManual(type: FileType) {
    if (this.isSubmitting[type]) return;
    this.isSubmitting[type] = true;

    try {
      let payload;
      let endpoint = '';
      if (type === 'grupos') {
        payload = this.nuevoGrupo;
        endpoint = '/admin-usuarios/grupo';
      } else if (type === 'materias') {
        payload = this.nuevaMateria;
        endpoint = '/admin-usuarios/materia';
      } else if (type === 'alumnos') {
        payload = this.nuevoAlumno;
        endpoint = '/admin-usuarios/alumno';
      } else if (type === 'profesores') {
        payload = this.nuevoProfesor;
        endpoint = '/admin-usuarios/profesor';
      }

      await this.api.post(endpoint, payload);
      console.log('MANUAL CREATE SUCCESS:', type);
      await this.cargarTodo();
      
      // Reset form
      if (type === 'grupos') this.nuevoGrupo = { grado: null, seccion: '' };
      if (type === 'materias') this.nuevaMateria = { nombre_materia: '', es_general: false };
      if (type === 'alumnos') this.nuevoAlumno = { matricula: '', nombre_estudiante: '', nombre_padre: '', grado: null, seccion: '' };
      if (type === 'profesores') this.nuevoProfesor = { docente_id: '', nombre_completo: '', nombre_materia: '', grado: null, seccion: '' };
      
      this.showForm[type] = false;
    } catch (err: any) {
      console.error('MANUAL CREATE FAILED:', err);
      const msg = err?.error?.message || 'Verifica que los datos sean correctos.';
      alert('Error al registrar manualmente: ' + msg);
    } finally {
      this.isSubmitting[type] = false;
    }
  }

  // =========================
  // NAVIGATION
  // =========================
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}