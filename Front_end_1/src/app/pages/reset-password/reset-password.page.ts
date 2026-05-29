import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  IonicModule,
  AlertController
} from '@ionic/angular';

import { Router } from '@angular/router';

import { SupabaseService }
from '../../services/supabase';

@Component({

  selector: 'app-reset-password',

  templateUrl:
    './reset-password.page.html',

  styleUrls:
    ['./reset-password.page.scss'],

  standalone: true,

  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]

})

export class ResetPasswordPage {

  password = '';

  confirmPassword = '';

  isLoading = false;

  showPassword = false;

  showConfirmPassword = false;

  constructor(

    private supabaseService:
      SupabaseService,

    private alertController:
      AlertController,

    private router: Router

  ) {}

  async restablecerContrasena() {

    if (
      !this.password ||
      !this.confirmPassword
    ) {

      this.showAlert(
        'Error',
        'Completa todos los campos.'
      );

      return;

    }

    if (
      this.password !==
      this.confirmPassword
    ) {

      this.showAlert(
        'Error',
        'Las contraseñas no coinciden.'
      );

      return;

    }

    this.isLoading = true;

    try {

      const { error } =
        await this.supabaseService
          .supabase.auth.updateUser({

            password:
              this.password

          });

      if (error) {

        await this.showAlert(
          'Error',
          error.message
        );

        this.isLoading = false;
        return;

      }

      await this.showAlert(
        'Éxito',
        'Tu contraseña fue actualizada.'
      );

      this.router.navigate([
        '/iniciar-sesion'
      ]);

    } catch (err) {

      console.error(err);

      await this.showAlert(
        'Error',
        'Ocurrió un error inesperado.'
      );

    } finally {

      this.isLoading = false;

    }

  }

  async showAlert(
    header: string,
    message: string
  ) {

    const alert =
      await this.alertController
        .create({

          header,
          message,
          buttons: ['Aceptar']

        });

    await alert.present();

  }

}