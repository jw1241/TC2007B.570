import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { StudentService } from '../../services/student';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-seleccionar-alumno',
  templateUrl: './seleccionar-alumno.page.html',
  styleUrls: ['./seleccionar-alumno.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class SeleccionarAlumnoPage implements OnInit {

  usuario: any;
  alumnos: any[] = [];

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private studentService: StudentService,
    private api: ApiService
  ) {}

  async ngOnInit() {
    try {
      // 1. Get authenticated user profile via Backend API
      const profileData = await this.api.get<any>('/auth/me');
      if (!profileData || !profileData.user) {
        this.router.navigate(['/iniciar-sesion']);
        return;
      }
      this.usuario = profileData.user;
      
      console.log('USUARIO:', this.usuario);
      console.log('PADRE ID:', this.usuario.id);

      // 2. Fetch linked students via Backend API
      const hijosData = await this.api.get<any>('/padre/mis-hijos');
      console.log('ALUMNOS DATA:', hijosData);

      this.alumnos = (hijosData.data || []).flatMap((item: any) =>
        item.alumnos ? [item.alumnos] : []
      );
      
      console.log('FINAL ALUMNOS:', this.alumnos);
    } catch (error) {
      console.error('Error in seleccionar-alumno:', error);
      this.router.navigate(['/iniciar-sesion']);
    }
  }


  onSelectStudent(alumno: any) {

    // Store globally
    this.studentService.setAlumno(
  alumno,
  this.studentService.getRegistrationCode()!
);

    // Navigate
    this.router.navigate([
  '/inicio-resumen-alumno'
]);
  }

  async logout() {

  await this.supabaseService
    .supabase
    .auth
    .signOut();

  localStorage.clear();

  this.studentService.clear();

  this.router.navigate([
    '/iniciar-sesion'
  ]);

}

}