import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
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
  nuevoAlumno = { nombre_estudiante: '', nombre_padre: '', grado: null, seccion: '' };
  nuevoProfesor = { nombre_completo: '', nombre_materia: '', grado: null, seccion: '' };

  isSubmitting: Record<FileType, boolean> = {
    grupos: false,
    alumnos: false,
    materias: false,
    profesores: false
  };

  isUploading = false;

  // =========================
  // MODAL STATE
  // =========================
  isModalOpen = false;
  modalType: FileType | null = null;
  itemToEdit: any = null;

  // =========================
  // ASSIGN MODAL STATE
  // =========================
  isAssignModalOpen = false;
  isAssigning = false;
  assignData: any = { identificacion_docente: '', nombre_materia: '', grado: null, seccion: '' };

  constructor(
    private api: ApiService,
    private router: Router,
    private toastController: ToastController
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
      if (type === 'alumnos') this.nuevoAlumno = { nombre_estudiante: '', nombre_padre: '', grado: null, seccion: '' };
      if (type === 'profesores') this.nuevoProfesor = { nombre_completo: '', nombre_materia: '', grado: null, seccion: '' };
      
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
  // CRUD (EDIT & DELETE)
  // =========================
  async eliminarRegistro(type: FileType, id: any) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.')) return;
    
    let endpoint = '';
    if (type === 'grupos') endpoint = `/admin-usuarios/grupos/${id}`;
    if (type === 'materias') endpoint = `/admin-usuarios/materias/${id}`;
    if (type === 'alumnos') endpoint = `/admin-usuarios/alumnos/${id}`;
    if (type === 'profesores') endpoint = `/admin-usuarios/profesores/${id}`;

    try {
      await this.api.delete(endpoint);
      alert('Registro eliminado con éxito.');
      await this.cargarTodo();
    } catch (err: any) {
      console.error('ERROR AL ELIMINAR:', err);
      alert('Error al eliminar: ' + (err?.error?.message || err.message));
    }
  }

  // Edit logic: open modal with a copy of the item
  abrirModalEdicion(type: FileType, item: any) {
    this.modalType = type;
    this.itemToEdit = JSON.parse(JSON.stringify(item));
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.modalType = null;
    this.itemToEdit = null;
  }

  // =========================
  // ASIGNAR MATERIA
  // =========================
  abrirModalAsignacion(profesor: any) {
    this.assignData = {
      identificacion_docente: profesor.docente_id,
      nombre_materia: '',
      grado: null,
      seccion: ''
    };
    this.isAssignModalOpen = true;
  }

  cerrarModalAsignacion() {
    this.isAssignModalOpen = false;
  }

  async submitAssign() {
    this.isAssigning = true;
    try {
      await this.api.post('/admin-usuarios/profesor/asignar', this.assignData);
      
      const toast = await this.toastController.create({
        message: 'Materia asignada con éxito al profesor.',
        duration: 2500,
        color: 'success',
        icon: 'checkmark-circle'
      });
      await toast.present();

      this.cerrarModalAsignacion();
      await this.cargarTodo();
    } catch (err: any) {
      console.error('ASSIGN FAILED:', err);
      const msg = err?.error?.message || 'Error al asignar la materia.';
      
      const toast = await this.toastController.create({
        message: 'Error: ' + msg,
        duration: 3500,
        color: 'danger',
        icon: 'alert-circle'
      });
      await toast.present();
    } finally {
      this.isAssigning = false;
    }
  }

  async guardarEdicion() {
    if (!this.modalType || !this.itemToEdit) return;

    let endpoint = '';
    let payload = {};
    let id = this.itemToEdit.id;
    const type = this.modalType;
    const item = this.itemToEdit;

    if (type === 'grupos') {
      endpoint = `/admin-usuarios/grupos/${id}`;
      if (!item.grado || !item.seccion) return;
      payload = { grado: parseInt(item.grado), seccion: item.seccion };
    } 
    else if (type === 'materias') {
      endpoint = `/admin-usuarios/materias/${id}`;
      if (!item.nombre_materia) return;
      payload = { nombre_materia: item.nombre_materia, es_general: item.es_general };
    }
    else if (type === 'alumnos') {
      endpoint = `/admin-usuarios/alumnos/${id}`;
      if (!item.nombre_estudiante || !item.grado || !item.seccion) return;
      payload = { nombre_estudiante: item.nombre_estudiante, grado: parseInt(item.grado), seccion: item.seccion };
    }
    else if (type === 'profesores') {
      id = item.docente_id; // For profesores we use docente_id
      endpoint = `/admin-usuarios/profesores/${id}`;
      if (!item.nombre_completo) return;
      payload = { nombre_completo: item.nombre_completo };
    }

    try {
      await this.api.put(endpoint, payload);
      alert('Registro actualizado con éxito.');
      this.cerrarModal();
      await this.cargarTodo();
    } catch (err: any) {
      console.error('ERROR AL ACTUALIZAR:', err);
      alert('Error al actualizar: ' + (err?.error?.message || err.message));
    }
  }

  // =========================
  // NAVIGATION
  // =========================
  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}