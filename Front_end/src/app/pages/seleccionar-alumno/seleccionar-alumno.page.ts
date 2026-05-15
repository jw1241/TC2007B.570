import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-seleccionar-alumno',
  templateUrl: './seleccionar-alumno.page.html',
  styleUrls: ['./seleccionar-alumno.page.scss'],
  imports: [IonContent]
})
export class SeleccionarAlumnoPage {
  private router = inject(Router);

  constructor() {}

  onSelectStudent() {
    this.router.navigate(['/inicio-resumen']);
  }
}
