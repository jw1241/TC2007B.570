import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

    const rememberedEmail =
      localStorage.getItem('rememberedEmail');

    if (rememberedEmail) {
      this.identifier = rememberedEmail;
      this.rememberMe = true;
    }
  }

  async iniciarSesion() {

    if (this.isLoading) return;

    this.isLoading = true;

    try {

      const result =
        await this.authService.login(
          this.identifier,
          this.password
        );

      if (!result.success) {
        alert(result.error || 'No se pudo iniciar sesión.');
        return;
      }

      // REMEMBER EMAIL (OK TO KEEP)
      if (this.rememberMe) {
        localStorage.setItem('rememberedEmail', this.identifier);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // ROLE REDIRECT (FROM SUPABASE USER)
      const user = result.user;

      if (user) {

        // IMPORTANT:
        // role should come from DB, NOT frontend user object
        const profile = await this.authService.getProfile();

        console.log("PROFILE:", profile);

        await this.authService.redirectByRole(profile?.rol_id);
      }

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