import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecuperarContrasenaPage {

  email: string = '';
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  volver() {
    this.router.navigate(['/iniciar-sesion']);
  }

  codigo() {
    console.log(this.email);
    this.errorMessage = '';
    
    // Enviar solicitud de recuperación al Backend (No a Supabase directamente)
    this.authService.resetPasswordForEmail(this.email).subscribe({
      next: (response) => {
        console.log('Correo enviado correctamente', response);
        // Redirigir a la pantalla de confirmación
        this.router.navigate(['/enviar-codigo'], {
          queryParams: { email: this.email }
        });
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Error al enviar el correo';
        console.error('Error:', this.errorMessage);
      }
    });
  }

}