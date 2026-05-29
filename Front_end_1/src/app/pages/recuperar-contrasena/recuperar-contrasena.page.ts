import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecuperarContrasenaPage {

  email: string = '';

  isLoading = false;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private alertController: AlertController
  ) {}

  volver() {

    this.router.navigate(['/iniciar-sesion']);

  }

  async codigo() {

    if (!this.email) {

      this.showAlert(
        'Error',
        'Ingresa un correo electrónico.'
      );

      return;

    }

    this.isLoading = true;

    try {

      // CHECK IF USER EXISTS
      const {
        data: existingUser,
        error: userError
      } =
        await this.supabaseService.supabase
          .from('usuarios')
          .select('email')
          .eq('email', this.email)
          .maybeSingle();

      console.log('USER:', existingUser);
      console.log('USER ERROR:', userError);

      // EMAIL NOT FOUND
      if (!existingUser) {

        await this.showAlert(
          'Correo no encontrado',
          'No existe una cuenta registrada con este correo electrónico.'
        );

        this.isLoading = false;
        return;

      }

      // SEND RESET EMAIL
      const {
        data,
        error
      } =
        await this.supabaseService.supabase.auth
          .resetPasswordForEmail(
            this.email,
            {

              redirectTo:
                'http://localhost:8100/reset-password'

            }
          );

      console.log('RESET DATA:', data);
      console.log('RESET ERROR:', error);

      if (error) {

        await this.showAlert(
          'Error',
          'No se pudo enviar el correo de recuperación.'
        );

        this.isLoading = false;
        return;

      }

      await this.showAlert(
        'Correo enviado',
        'Te enviamos un enlace para restablecer tu contraseña.'
      );

      this.router.navigate(
        ['/enviar-codigo'],
        {
          queryParams: {
            email: this.email
          }
        }
      );

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
      await this.alertController.create({

        header,
        message,
        buttons: ['Aceptar']

      });

    await alert.present();

  }

}