import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { StudentService } from '../../services/student';
import { HttpClient } from '@angular/common/http';

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
    private authService: AuthService,
    private studentService: StudentService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    // Almacenaremos el token para validar que existe sesión local
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/iniciar-sesion']);
      return;
    }

    // TODO: Llamar al backend para obtener el perfil del usuario autenticado
    // this.http.get('http://localhost:3000/api/perfil').subscribe(...)

    // TODO: Llamar al backend para obtener los alumnos ligados (parentescos)
    // this.http.get('http://localhost:3000/api/padres/hijos').subscribe(...)
    
    // Por ahora, para que compile y no truene:
    this.usuario = { nombre_completo: 'Usuario Cargando...' };
    this.alumnos = [];
  }


  onSelectStudent(alumno: any) {

    // Store globally
    this.studentService.setAlumno(alumno);

    // Navigate
    this.router.navigate(['/inicio-resumen']);
  }

  logout() {
    // Remove local token
    localStorage.removeItem('token');
    
    // Inform backend to logout
    this.authService.logout().subscribe({
      next: () => console.log('Logged out successfully'),
      error: (err) => console.error('Logout error', err)
    });

    // Clear selected student
    this.studentService.clearAlumno();

    // Redirect to login
    this.router.navigate(['/iniciar-sesion']);
  }

}