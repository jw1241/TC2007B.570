import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { StudentService } from '../../services/student';

@Component({
  selector: 'app-registro2',
  templateUrl: './registro2.page.html',
  styleUrls: ['./registro2.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class Registro2Page implements OnInit {
  
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  parentName: string = '';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private studentService: StudentService
  ) {}

  ngOnInit() {}

  volver() {
    this.router.navigate(['/registro']);
  }

  async crearCuenta() {

  // Validate parent name
  if (!this.parentName.trim()) {

    alert('Ingresa el nombre del padre o tutor');
    return;

  }

  // Password match
  if (this.password !== this.confirmPassword) {

    alert('Las contraseñas no coinciden');
    return;

  }

  // Password requirements
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{12,16}$/;

  if (!passwordRegex.test(this.password)) {

    alert(
      'La contraseña debe tener entre 12 y 16 caracteres, incluir mayúsculas, minúsculas y un símbolo especial.'
    );

    return;

  }

  // Get validated alumno
  const alumno =
    this.studentService.getAlumno();

  console.log('ALUMNO:', alumno);

  if (!alumno) {

    alert('No se encontró información del alumno');
    return;

  }

  // Save temporary registration
  const registrationData = {

    alumno,
    parentName: this.parentName

  };

  console.log(
    'SAVING REGISTRATION:',
    registrationData
  );

  localStorage.setItem(
    'pendingRegistration',
    JSON.stringify(registrationData)
  );

  // Create auth account
  const { data, error } =
    await this.supabaseService.supabase.auth.signUp({

      email: this.email,
      password: this.password

    });

  console.log('SIGNUP DATA:', data);
  console.log('SIGNUP ERROR:', error);

  if (error) {

    alert(error.message);

    // Cleanup failed registration
    localStorage.removeItem(
      'pendingRegistration'
    );

    return;

  }

  alert(
    'Cuenta creada correctamente. Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.'
  );

  this.router.navigate(['/iniciar-sesion']);

}

}