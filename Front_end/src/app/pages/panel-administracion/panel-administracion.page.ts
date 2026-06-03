import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-panel-administracion',
  templateUrl: './panel-administracion.page.html',
  styleUrls: ['./panel-administracion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PanelAdministracionPage implements OnInit {
  isMenuOpen = false;
  activeTab = 'alumnos';
  alumnos: any[] = [];
  profesores: any[] = [];
  isLoading = true;

  constructor(private navCtrl: NavController, private api: ApiService) { }

  async ngOnInit() {
    await this.cargarDatos();
  }

  navigateTo(path: string) {
    this.navCtrl.navigateRoot(path);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  async cargarDatos() {
    this.isLoading = true;
    try {
      const [alumnosRes, usuariosRes] = await Promise.all([
        this.api.get<any>('/admin/alumnos'),
        this.api.get<any>('/admin/usuarios?limit=1000') // Get all users for now
      ]);
      
      this.alumnos = alumnosRes.data || [];
      const todosLosUsuarios = usuariosRes.data || [];
      this.profesores = todosLosUsuarios.filter((u: any) => u.rol_id === 2); // 2 is Docente
      
    } catch (error) {
      console.error('Error cargando datos del admin', error);
    } finally {
      this.isLoading = false;
    }
  }

  getIniciales(nombre: string, apellidos: string): string {
    return (nombre?.charAt(0) || '') + (apellidos?.charAt(0) || '');
  }
  
  getInicialesString(completo: string): string {
    if (!completo) return '';
    const parts = completo.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return completo.charAt(0).toUpperCase();
  }
}
