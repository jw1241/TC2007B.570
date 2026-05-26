import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio-resumen',
  templateUrl: './inicio-resumen.page.html',
  styleUrls: ['./inicio-resumen.page.scss'],
  imports: [IonContent]
})
export class InicioResumenPage {
  constructor(private router: Router) {}

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
