import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-panel-administracion',
  templateUrl: './panel-administracion.page.html',
  styleUrls: ['./panel-administracion.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class PanelAdministracionPage implements OnInit {
  isMenuOpen = false;
  activeTab = 'alumnos';

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  navigateTo(path: string) {
    this.navCtrl.navigateRoot(path);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }
}
