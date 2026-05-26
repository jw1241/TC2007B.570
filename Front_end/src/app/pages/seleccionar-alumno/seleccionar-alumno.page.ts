import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService} from '../../services/supabase';
import { StudentService } from '../../services/student';

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
    private studentService: StudentService
  ) {}

  async ngOnInit() {

    // Current authenticated user
    const {
      data: { user }
    } = await this.supabaseService.supabase.auth.getUser();

    if (!user) {

      this.router.navigate(['/iniciar-sesion']);
      return;

    }

    // Fetch user profile
    console.log('AUTH USER:', user);
    console.log('AUTH USER ID:', user.id);

    const response =
      await this.supabaseService.supabase
        .from('usuarios')
        .select(`
          id,
          nombre_completo,
          email,
          roles (
            nombre_rol
          )
        `)
        .eq('id', user.id);

    console.log('FULL RESPONSE:', response);

    const { data: usuarioData, error: usuarioError } =
      await this.supabaseService.supabase
        .from('usuarios')
        .select(`
          id,
          nombre_completo,
          email,
          roles (
            nombre_rol
          )
        `)
        .eq('id', user.id)
        .single();

    if (usuarioError) {

      console.error(usuarioError);
      return;

    }

    this.usuario = usuarioData;

    // Fetch linked students
    const { data, error } =
      await this.supabaseService.supabase
        .from('parentescos')
        .select(`
          alumnos (
            id,
            matricula,
            nombre_completo,
            fecha_nacimiento,
            grupos (
              grado,
              seccion
            )
          )
        `)
        .eq('padre_id', user.id);

        console.log('ALUMNOS DATA:', data);
        console.log('ALUMNOS ERROR:', error);

    if (error) {

      console.error(error);
      return;

    }

    this.alumnos =
  data
    ?.filter((item: any) => item.alumnos)
    .map((item: any) => item.alumnos) || [];

  console.log('FINAL ALUMNOS:', this.alumnos);
  }


  onSelectStudent(alumno: any) {

    // Store globally
    this.studentService.setAlumno(alumno);

    // Navigate
    this.router.navigate(['/inicio-resumen']);
  }

  async logout() {

    // Close Supabase session
    await this.supabaseService.supabase.auth.signOut();

    // Clear selected student
    this.studentService.clearAlumno();

    // Redirect to login
    this.router.navigate(['/iniciar-sesion']);
    
  }

}