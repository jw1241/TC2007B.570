import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-captura-calificaciones',
  templateUrl: './captura-calificaciones.page.html',
  styleUrls: ['./captura-calificaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CapturaCalificacionesPage implements OnInit {
  clases: any[] = [];
  activeClase: any = null;
  alumnos: any[] = [];
  isLoading = true;
  isSaving = false;
  trimestreActivo: number = 1;

  // We need to keep track of changes to save them
  // A map of alumno_id -> calificacion
  calificacionesEditadas: { [key: number]: number } = {};

  constructor(
    private navCtrl: NavController,
    private api: ApiService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarClases();
  }
  
  navigateTo(path: string) {
    this.navCtrl.navigateRoot(path);
  }

  async cargarClases() {
    this.isLoading = true;
    try {
      const response = await this.api.get<any>('/docente/mis-clases');
      this.clases = response.data || [];
      if (this.clases.length > 0) {
        this.seleccionarClase(this.clases[0]);
      }
    } catch (error) {
      console.error('Error cargando clases:', error);
      this.mostrarToast('Error al cargar clases asignadas', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async seleccionarClase(clase: any) {
    this.activeClase = clase;
    this.calificacionesEditadas = {};
    this.isLoading = true;
    this.alumnos = [];
    try {
      const response = await this.api.get<any>(
        `/docente/clase/${clase.grupos.id}/materia/${clase.materias.id}/alumnos`
      );
      this.alumnos = response.data || [];
      
      // Initialize edit form with existing grades
      this.alumnos.forEach(alumno => {
        const califObj = alumno.calificaciones[`trimestre_${this.trimestreActivo}`];
        if (califObj && califObj.calificacion !== null) {
          this.calificacionesEditadas[alumno.id] = califObj.calificacion;
        }
      });
    } catch (error) {
      console.error('Error cargando alumnos:', error);
      this.mostrarToast('Error al cargar alumnos de la clase', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  setTrimestre(t: number) {
    this.trimestreActivo = t;
    // Re-initialize form
    this.calificacionesEditadas = {};
    this.alumnos.forEach(alumno => {
        const califObj = alumno.calificaciones[`trimestre_${this.trimestreActivo}`];
        if (califObj && califObj.calificacion !== null) {
          this.calificacionesEditadas[alumno.id] = califObj.calificacion;
        }
      });
  }

  onCalificacionChange(alumnoId: number, event: any) {
    const val = parseFloat(event.target.value);
    if (!isNaN(val)) {
      this.calificacionesEditadas[alumnoId] = val;
    } else {
      delete this.calificacionesEditadas[alumnoId];
    }
  }

  async guardarCambios() {
    if (!this.activeClase) return;
    this.isSaving = true;

    try {
      const requests = Object.keys(this.calificacionesEditadas).map(alumnoIdStr => {
        const alumnoId = parseInt(alumnoIdStr, 10);
        const calificacion = this.calificacionesEditadas[alumnoId];
        
        return this.api.put('/docente/calificaciones', {
          alumno_id: alumnoId,
          materia_id: this.activeClase.materias.id,
          trimestre: this.trimestreActivo,
          calificacion: calificacion
        });
      });

      await Promise.all(requests);
      this.mostrarToast('Calificaciones guardadas exitosamente', 'success');
      
      // Refresh to get DB state
      await this.seleccionarClase(this.activeClase);

    } catch (error) {
      console.error('Error guardando:', error);
      this.mostrarToast('Error al guardar calificaciones', 'danger');
    } finally {
      this.isSaving = false;
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }

  getIniciales(nombre: string, apellidos: string): string {
    return (nombre?.charAt(0) || '') + (apellidos?.charAt(0) || '');
  }
}
