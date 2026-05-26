import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { StudentService } from '../../services/student';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class IniciarSesionPage implements OnInit {

  identifier = '';
  password = '';

  rememberMe = false;
  showPassword = false;

  isLoading = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private studentService: StudentService
  ) {}

  ngOnInit() {

  // Load remembered email
  const rememberedEmail =
    localStorage.getItem('rememberedEmail');

  if (rememberedEmail) {

    this.identifier = rememberedEmail;
    this.rememberMe = true;

  }

}

  async onLogin() {

  if (this.isLoading) return;

  this.isLoading = true;

  try {

    const { data, error } =
      await this.supabaseService.supabase.auth.signInWithPassword({

        email: this.identifier,
        password: this.password

      });

    // LOGIN ERRORS
    if (error) {

      if (
        error.message.includes('Email not confirmed')
      ) {

        alert(
          'Debes verificar tu correo electrónico antes de iniciar sesión.'
        );

      } else {

        alert(
          'Correo electrónico o contraseña incorrectos.'
        );

      }

      return;

    }

    const user = data.user;

    if (!user) {

      alert('No se encontró el usuario');
      return;

    }

    // EMAIL VERIFICATION CHECK
    if (!user.email_confirmed_at) {

      alert(
        'Debes verificar tu correo electrónico antes de iniciar sesión.'
      );

      await this.supabaseService.supabase.auth.signOut();

      return;

    }

    // CHECK IF USER EXISTS
    const { data: existingUser } =
      await this.supabaseService.supabase
        .from('usuarios')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    // CREATE USER IF FIRST LOGIN
    if (!existingUser) {

      console.log('Creating usuario...');

      const pendingRegistration =
        localStorage.getItem('pendingRegistration');

      console.log('PENDING:', pendingRegistration);

      if (!pendingRegistration) {

        alert('No se encontró información de registro');
        return;

      }

      const parsed =
        JSON.parse(pendingRegistration);

      const alumno = parsed.alumno;
      const parentName = parsed.parentName;

      console.log('ALUMNO:', alumno);
      console.log('PARENT NAME:', parentName);

      // VALIDATE STUDENT
      if (!alumno?.id) {

        alert('Alumno inválido');
        return;

      }

      // VALIDATE PARENT NAME
      if (!parentName) {

        alert('Nombre del padre requerido');
        return;

      }

      // CREATE USUARIO
      const {
        data: usuarioData,
        error: usuarioError
      } =
        await this.supabaseService.supabase
          .from('usuarios')
          .insert({

            id: user.id,
            email: user.email,
            nombre_completo: parentName,
            rol_id: 1,
            activo: true

          })
          .select();

      console.log('USUARIO DATA:', usuarioData);
      console.log('USUARIO ERROR:', usuarioError);

      if (usuarioError) {

        alert(usuarioError.message);
        return;

      }

      // CREATE PARENTESCO
      const {
        data: parentescoData,
        error: parentescoError
      } =
        await this.supabaseService.supabase
          .from('parentescos')
          .insert({

            padre_id: user.id,
            alumno_id: alumno.id

          })
          .select();

      console.log('PARENTESCO DATA:', parentescoData);
      console.log('PARENTESCO ERROR:', parentescoError);

      if (parentescoError) {

        alert(parentescoError.message);
        return;

      }

      console.log('User fully initialized');

      // CLEANUP
      localStorage.removeItem(
        'pendingRegistration'
      );

    }

    // REMEMBER EMAIL
    if (this.rememberMe) {

      localStorage.setItem(
        'rememberedEmail',
        this.identifier
      );

    } else {

      localStorage.removeItem(
        'rememberedEmail'
      );

    }

    // NAVIGATE
    this.router.navigate(['/seleccionar-alumno']);

  } catch (err) {

    console.error(err);

    alert(
      'Ocurrió un error inesperado.'
    );

  } finally {

    this.isLoading = false;

  }

}

recuperarcontrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }

  Registro() {
    this.router.navigate(['/registro']);
  }

  soporteTecnico() {
    this.router.navigate(['/soporte-tecnico']);
  }

}