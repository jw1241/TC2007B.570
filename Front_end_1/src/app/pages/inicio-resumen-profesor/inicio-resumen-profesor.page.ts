import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio-resumen-profesor',
  templateUrl: './inicio-resumen-profesor.page.html',
  styleUrls: ['./inicio-resumen-profesor.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InicioResumenProfesorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
