import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iniciar-sesion',
  templateUrl: './iniciar-sesion.page.html',
  styleUrls: ['./iniciar-sesion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class IniciarSesionPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onLogin() {
    // Redirigir al inicio o a la vista de seleccionar alumno de forma genérica
    this.router.navigate(['/seleccionar-alumno']);
  }

  recuperarcontrasena() {
    this.router.navigate(['/recuperar-contrasena']);
  }

  Registro() {
    this.router.navigate(['/registro']);
  }

}
