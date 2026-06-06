import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';

import { ApiService } from '../../services/api';

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
    private alertController: AlertController,
    private api: ApiService
  ) {}

  volver() {

    this.router.navigate(['/iniciar-sesion']);

  }

  async codigo() {

  if (!this.email) {

    await this.showAlert(
      'Error',
      'Ingresa un correo electrónico.'
    );

    return;

  }

  this.isLoading = true;

  try {

    await this.api.post('/auth/recuperar-contrasena', { email: this.email });

    // SUCCESS
    await this.showAlert(
      'Correo enviado',
      'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.'
    );

    // RETURN TO LOGIN PAGE
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
      await this.alertController.create({

        header,
        message,
        buttons: ['Aceptar']

      });

    await alert.present();

  }

}