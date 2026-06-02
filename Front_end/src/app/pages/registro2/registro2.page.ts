import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

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

  showPassword = false;
  showConfirmPassword = false;

  usuarioId: string = '';

  role: 'padre' | 'docente' = 'padre';

  nombreCompleto: string = '';

  registrationCode: string = '';

  email: string = '';

  password: string = '';

  confirmPassword: string = '';

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {

    const state = history.state;

    console.log(
      '📦 RAW HISTORY STATE:',
      state
    );

    /**
     * LOAD STATE
     */
    this.role =
      state?.role || 'padre';

    this.usuarioId =
      state?.usuarioId || '';

    this.registrationCode =
      state?.registrationCode || '';

    this.nombreCompleto =
      state?.nombre || '';

    console.log(
      '✅ FINAL PAGE STATE:',
      {
        role: this.role,
        usuarioId: this.usuarioId,
        registrationCode: this.registrationCode,
        nombreCompleto: this.nombreCompleto
      }
    );

  }

  get hasMinLength(): boolean {
    return this.password.length >= 12;
  }

  get hasMaxLength(): boolean {
    return this.password.length <= 16;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.password);
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get hasSpecialChar(): boolean {
    return /[^A-Za-z0-9]/.test(this.password);
  }

  volver() {

    this.router.navigate([
      '/registro'
    ]);

  }

  async crearCuenta() {

    try {

      if (
        this.password !==
        this.confirmPassword
      ) {

        alert(
          'Las contraseñas no coinciden'
        );

        return;

      }

      const payload = {

        usuarioId:
          this.usuarioId,

        registrationCode:
          this.registrationCode,

        role:
          this.role,

        email:
          this.email,

        password:
          this.password

      };

      console.log(
        '📤 ACTIVATION PAYLOAD:',
        payload
      );

      const res: any =
        await this.api.post(
          '/auth/activate-account',
          payload
        );

      console.log(
        '✅ ACTIVATION RESPONSE:',
        res
      );

      if (res?.success) {

        alert(
          'Cuenta creada correctamente'
        );

        this.router.navigate([
          '/iniciar-sesion'
        ]);

      }

    } catch (err: any) {

      console.error(
        '❌ ACTIVATION ERROR:',
        err
      );

      alert(
        err?.error?.error?.message ||
        'No se pudo crear la cuenta'
      );

    }

  }

}