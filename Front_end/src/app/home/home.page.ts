import { Component, inject } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonContent],
})
export class HomePage {
  private router = inject(Router);

  constructor() {}

  onLogin() {
    this.router.navigate(['/seleccionar-alumno']);
  }
}
