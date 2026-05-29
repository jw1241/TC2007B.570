import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-enviar-codigo',
  templateUrl: './enviar-codigo.page.html',
  styleUrls: ['./enviar-codigo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class EnviarCodigoPage implements OnInit {

  email: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      console.log(this.email);
    });
  }

  volver() {
    this.router.navigate(['/recuperar-contrasena']);
  }

}