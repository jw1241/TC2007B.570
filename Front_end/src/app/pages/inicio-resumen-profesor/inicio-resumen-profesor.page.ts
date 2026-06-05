import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio-resumen-profesor',
  templateUrl: './inicio-resumen-profesor.page.html',
  styleUrls: ['./inicio-resumen-profesor.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class InicioResumenProfesorPage implements OnInit {

  docente: any = null;

  materias: any[] = [];
  calificaciones: any[] = [];
  mensajes: any[] = [];
  grupos: any[] = [];

  resumen = {
    grupos: 0,
    materias: 0,
    mensajes: 0,
    calificaciones: 0
  };

  isLoading = false;
  errorMessage = '';

  constructor(private api: ApiService, private authService: AuthService) {}

  async ngOnInit() {
    const profile = await this.authService.getProfile();
const docenteId = profile?.id;

    const response = await this.api.get<any>(`/teacher/${docenteId}/dashboard`);

    console.log('USER_ID FROM STORAGE:', localStorage.getItem('user_id'));

console.log('FULL RESPONSE:', response);

    if (!docenteId) {
      this.errorMessage = 'No docente encontrado';
      return;
    }

    await this.loadDashboard(docenteId);
  }

  async loadDashboard(docenteId: string) {
  try {
    this.isLoading = true;

    const data = await this.api.get<any>(
      `/teacher/${docenteId}/dashboard`
    );

    console.log('DASHBOARD:', data);

    this.docente = data.docente;
    this.resumen = data.resumen;

    this.materias = data.materias ?? [];

  } catch (err) {
    console.error(err);
    this.errorMessage = 'Error loading dashboard';
  } finally {
    this.isLoading = false;
  }
}

  refresh(event?: any) {
    const id = localStorage.getItem('user_id');
    if (id) this.loadDashboard(id);
    event?.target?.complete();
  }

  abrirMensajes() {
  console.log('Open messages');
}

crearCalificacion() {
  console.log('Create grade');
}
}