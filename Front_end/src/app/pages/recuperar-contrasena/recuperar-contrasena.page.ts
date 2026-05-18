import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.page.html',
  styleUrls: ['./recuperar-contrasena.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecuperarContrasenaPage {

  email: string = '';

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/iniciar-sesion']);
  }

  codigo() {
    console.log(this.email);
    
    this.router.navigate(['/enviar-codigo'],
  {
        queryParams: {
          email: this.email
        }
      }
    );
  }

}