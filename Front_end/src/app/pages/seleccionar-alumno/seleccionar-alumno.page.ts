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
    .eq('auth_user_id', user.id)
    .maybeSingle();

console.log('USUARIO RESPONSE:', {
  data: usuarioData,
  error: usuarioError
});

    if (usuarioError || !usuarioData) {

  console.error(usuarioError);
  return;

}

this.usuario = usuarioData;

console.log('USUARIO:', usuarioData);
console.log('PADRE ID:', usuarioData.id);

    // Fetch linked students
    const { data: alumnosData, error: alumnosError } =
  await this.supabaseService.supabase
    .from('parentescos')
    .select(`
      alumno_id,
      alumnos (
        id,
        matricula,
        nombre_completo,
        fecha_nacimiento,
        grupo_id,
        grupos:grupo_id (
          grado,
          seccion
        )
      )
    `)
   .eq('padre_id', usuarioData.id);

console.log('ALUMNOS DATA:', alumnosData);
console.log('ALUMNOS ERROR:', alumnosError);

    if (alumnosError) {

      console.error(alumnosError);
      return;

    }

    this.alumnos =
  (alumnosData || []).flatMap((item: any) =>
    item.alumnos ? [item.alumnos] : []
  );
  console.log('FINAL ALUMNOS:', this.alumnos);
console.log('FIRST ALUMNO:', this.alumnos[0]);
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