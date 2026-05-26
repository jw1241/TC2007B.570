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

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private studentService: StudentService
  ) {}

  ngOnInit() {}

  // async onLogin() {

  //   const { data, error } =
  //     await this.supabaseService.supabase.auth.signInWithPassword({

  //       email: this.identifier,
  //       password: this.password

  //     });

  //   if (error) {

  //     alert(error.message);
  //     return;

  //   }

  //   this.router.navigate(['/seleccionar-alumno']);
  // }

  

  async onLogin() {

  console.log('Identifier:', this.identifier);
  console.log('Password:', this.password);

  try {

    const { data, error } =
      await this.supabaseService.supabase.auth.signInWithPassword({

        email: this.identifier,
        password: this.password

      });

    console.log('Supabase response:', data);
    console.log('Supabase error:', error);

    if (error) {

      alert(error.message);
      return;

    }

    console.log('LOGIN SUCCESS');

    this.router.navigate(['/seleccionar-alumno']);

  } catch (err) {

    console.error('CATCH ERROR:', err);

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