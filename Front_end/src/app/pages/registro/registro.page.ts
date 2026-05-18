import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule
  ]
})
export class RegistroPage implements OnInit {

  studentId: string = '';
  birthDate: string = '';
  registrationCode: string = '';

  constructor(private router: Router) {}

  ngOnInit() {}

  volver() {
    this.router.navigate(['/iniciar-sesion']);
  }

  continuar() {
    this.router.navigate(['/registro2']);
  }

}