import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';
import { StudentService } from '../../services/student';
import { AuthService } from '../../services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-boleta',
  templateUrl: './boleta.page.html',
  styleUrls: ['./boleta.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BoletaPage implements OnInit {
  alumno: any = null;
  materias: any[] = [];
  isLoading = true;
  firmado = false;
  promedioGeneral = 0;

  constructor(
    private router: Router,
    private api: ApiService,
    private studentService: StudentService,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.alumno = this.studentService.getAlumno();
    if (!this.alumno) {
      this.router.navigate(['/seleccionar-alumno']);
      return;
    }
    await this.cargarCalificaciones();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  async cargarCalificaciones() {
    this.isLoading = true;
    try {
      const response = await this.api.get<any>(`/padre/hijo/${this.alumno.id}/calificaciones`);
      this.materias = response.data || [];
      
      // Calculate general average
      let suma = 0;
      let count = 0;
      this.materias.forEach(m => {
        // Iterate over trimestres to find grades
        for (let t = 1; t <= 3; t++) {
          const calif = m.trimestres[t]?.calificacion;
          if (calif !== undefined && calif !== null) {
            suma += parseFloat(calif);
            count++;
          }
        }
      });
      this.promedioGeneral = count > 0 ? suma / count : 0;
      
    } catch (error) {
      console.error('Error cargando calificaciones', error);
      this.mostrarToast('Error al cargar la boleta', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async firmarBoleta() {
    try {
      await this.api.post(`/padre/hijo/${this.alumno.id}/firmar-acuse`, {});
      this.firmado = true;
      this.mostrarToast('Boleta firmada de conformidad exitosamente', 'success');
    } catch (error) {
      console.error('Error al firmar boleta', error);
      this.mostrarToast('Hubo un error al intentar firmar la boleta', 'danger');
    }
  }

  async descargarBoleta() {
    try {
      const blob = await this.api.getBlob(`/boletas/${this.alumno.id}/descargar-pdf`);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Boleta_${this.alumno.matricula || this.alumno.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      this.mostrarToast('Descargando boleta...', 'success');
    } catch (error) {
      console.error('Error descargar PDF', error);
      this.mostrarToast('Error al generar PDF', 'danger');
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

  async logout() {
    await this.authService.logout();
  }
}
