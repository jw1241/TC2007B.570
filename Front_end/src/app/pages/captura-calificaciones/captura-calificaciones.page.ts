import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  NavController
} from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-captura-calificaciones',
  standalone: true,
  templateUrl: './captura-calificaciones.page.html',
  styleUrls: ['./captura-calificaciones.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ]
})
export class CapturaCalificacionesPage implements OnInit {

  docenteId = '';

  materias: any[] = [];
  periodos: any[] = [];

  materiaSeleccionada: any = null;
  periodoSeleccionado: any = null;

  alumnos: any[] = [];

  isLoading = false;
  isSaving = false;
  isPublishing = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toastCtrl: ToastController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    const profile = await this.auth.getProfile();

    this.docenteId = profile?.id;

    await this.cargarMaterias();
    await this.cargarPeriodos();
  }

  navigateTo(path: string) {
    this.navCtrl.navigateRoot(path);
  }

  async cargarMaterias() {
    try {
      this.isLoading = true;

      const response = await this.api.get<any>(
        `/teacher/${this.docenteId}/clases`
      );

      this.materias = response || [];
    } catch (err) {
      console.error(err);
      this.toast('Error cargando materias', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async cargarPeriodos() {
    try {
      const response = await this.api.get<any>('/periodos');
      this.periodos = response || [];
    } catch (err) {
      console.error(err);
    }
  }

  async seleccionarMateria(materia: any) {
    this.materiaSeleccionada = materia;

    if (this.periodoSeleccionado) {
      await this.cargarAlumnos();
    }
  }

  async seleccionarPeriodo(periodo: any) {
    this.periodoSeleccionado = periodo;

    await this.cargarFirmas();

    if (this.materiaSeleccionada) {
      await this.cargarAlumnos();
    }
  }

  firmas: any[] = [];

  async cargarFirmas() {
    if (!this.periodoSeleccionado) {
      return;
    }

    this.firmas = await this.api.get(
      `/teacher/periodos/${this.periodoSeleccionado.id}/firmas`
    );
  }

  async cargarAlumnos() {
    if (!this.materiaSeleccionada || !this.periodoSeleccionado) {
      return;
    }

    try {
      this.isLoading = true;

      const response = await this.api.get<any>(
        `/teacher/materia/${this.materiaSeleccionada.materia_id}/grupo/${this.materiaSeleccionada.grupo_id}/periodo/${this.periodoSeleccionado.id}`
      );

      this.alumnos = response || [];
    } catch (err) {
      console.error(err);
      this.toast('Error cargando alumnos', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async guardarCambios() {
    if (!this.periodoSeleccionado) return;

    try {
      this.isSaving = true;

      const requests: Promise<any>[] = [];

      for (const alumno of this.alumnos) {
        for (const tarea of (alumno.tareas || [])) {
          requests.push(
            this.api.put('/teacher/calificaciones', {
              id: tarea.id,
              alumno_id: alumno.id,
              materia_id: this.materiaSeleccionada.materia_id,
              periodo_id: this.periodoSeleccionado.id,
              tarea: tarea.tarea,
              nota: tarea.nota,
              comentario: tarea.comentario
            })
          );
        }
      }

      await Promise.all(requests);

      this.toast('Calificaciones guardadas', 'success');
    } catch (err) {
      console.error(err);
      this.toast('Error guardando calificaciones', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  async publicarBoletas() {
    if (!this.periodoSeleccionado) return;

    try {
      this.isPublishing = true;

      await this.api.post(
        `/teacher/periodos/${this.periodoSeleccionado.id}/publicar`,
        { usuarioId: this.docenteId }
      );

      this.toast('Boletas publicadas correctamente', 'success');
    } catch (err) {
      console.error(err);
      this.toast('Error publicando boletas', 'danger');
    } finally {
      this.isPublishing = false;
    }
  }

  async toast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 3000,
      position: 'top'
    });

    await toast.present();
  }

  agregarTarea(alumno: any) {
    if (!alumno.tareas) {
      alumno.tareas = [];
    }

    alumno.tareas.push({
      tarea: '',
      nota: null,
      comentario: ''
    });
  }

  async eliminarTarea(alumno: any, tarea: any, index: number) {
    if (tarea.id) {
      try {
        await this.api.delete(`/teacher/calificaciones/${tarea.id}`);
      } catch (err) {
        this.toast('Error al eliminar la calificación', 'danger');
        return;
      }
    }
    alumno.tareas.splice(index, 1);
  }

  getPromedio(alumno: any): string {
    const notas = (alumno.tareas || [])
      .filter((t: any) => t.nota !== null && t.nota !== undefined && t.nota !== '')
      .map((t: any) => Number(t.nota))
      .filter((n: number) => !isNaN(n));

    if (notas.length === 0) return '—';

    const avg = notas.reduce((sum: number, n: number) => sum + n, 0) / notas.length;
    return avg.toFixed(1);
  }

  getIniciales(nombre: string) {
    return nombre
      ?.split(' ')
      ?.map(x => x[0])
      ?.slice(0, 2)
      ?.join('')
      ?.toUpperCase() || '';
  }

  get firmadas(): number {
    return this.firmas.filter(f => f.firmada).length;
  }

  get pendientes(): number {
    return this.firmas.filter(f => !f.firmada).length;
  }

  async logout() {
    await this.auth.logout();
  }
}
