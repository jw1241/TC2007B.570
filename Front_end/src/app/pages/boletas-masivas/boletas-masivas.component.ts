import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-boletas-masivas',
  templateUrl: './boletas-masivas.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class BoletasMasivasPage implements OnInit {
  isDownloading = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private toastCtrl: ToastController,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async descargarBoletasMasivas() {
    this.isDownloading = true;
    try {
      this.mostrarToast('Generando boletas masivas, por favor espera...', 'primary');
      
      const blob = await this.api.getBlob('/boletas/masivas');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Boletas_Masivas_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      this.mostrarToast('Descarga completada', 'success');
    } catch (error) {
      console.error('Error descargar PDF masivo', error);
      this.mostrarToast('Error al generar PDF masivo', 'danger');
    } finally {
      this.isDownloading = false;
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
