import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  private timeoutId: any;
  private readonly TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos (RNF06)

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  public startWatching() {
    this.resetTimer();
    // Escuchar eventos globales del usuario
    window.addEventListener('mousemove', () => this.resetTimer());
    window.addEventListener('click', () => this.resetTimer());
    window.addEventListener('keypress', () => this.resetTimer());
    window.addEventListener('scroll', () => this.resetTimer());
    window.addEventListener('touchstart', () => this.resetTimer());
  }

  private resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    // Corremos fuera de Angular zone para evitar ciclos de detección de cambios innecesarios
    this.ngZone.runOutsideAngular(() => {
      this.timeoutId = setTimeout(() => {
        this.ngZone.run(() => {
          this.logoutUser();
        });
      }, this.TIMEOUT_MS);
    });
  }

  private logoutUser() {
    console.warn('Sesión expirada por inactividad (RNF06). Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/iniciar-sesion']);
  }
}
