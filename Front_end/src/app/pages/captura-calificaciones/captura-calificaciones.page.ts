import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-captura-calificaciones',
  templateUrl: './captura-calificaciones.page.html',
  styleUrls: ['./captura-calificaciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class CapturaCalificacionesPage implements OnInit {
  constructor(private navCtrl: NavController) {}

  ngOnInit() {}
  
  navigateTo(path: string) {
    this.navCtrl.navigateRoot(path);
  }
}
