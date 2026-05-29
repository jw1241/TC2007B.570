import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio-resumen-administrador',
  templateUrl: './inicio-resumen-administrador.page.html',
  styleUrls: ['./inicio-resumen-administrador.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InicioResumenAdministradorPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
