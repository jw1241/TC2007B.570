import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sanitizeInput } from '../../utils/sanitizer';

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

  role: 'padre' | 'docente' = 'padre';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');

    if (rememberedEmail) {
      this.identifier = rememberedEmail;
      this.rememberMe = true;
    }
  }

  async iniciarSesion() {

    if (this.isLoading) return;

    this.isLoading = true;

    try {
      const sanitizedIdentifier = sanitizeInput(this.identifier);

      const result =
        await this.authService.login(
          sanitizedIdentifier,
          this.password
        );

      if (!result.success) {
        alert(result.error || 'No se pudo iniciar sesión.');
        return;
      }

      // remember email
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.identifier);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // GET PROFILE FROM DB
      const profile = await this.authService.getProfile();

      if (!profile) {
        alert(
          'Tu usuario no tiene un perfil asociado. Contacta al administrador.'
        );
        await this.authService.logout();
        return;
      }

      // store correct user id (DB id, NOT auth id)
      localStorage.setItem('user_id', profile.id);

      console.log('PROFILE:', profile);

      // ROLE REDIRECT
      await this.authService.redirectByRole(profile.rol_id);

    } catch (err) {

      console.error(err);
      alert('Ocurrió un error inesperado.');

    } finally {
      this.isLoading = false;
    }
  }

  Registro() {
    this.router.navigate(['/registro']);
  }

  recuperarcontrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }

  soporteTecnico() {
    this.router.navigate(['/soporte-tecnico']);
  }
}