import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistroPage implements OnInit {

  role: 'padre' | 'docente' = 'padre';

  Id: string = '';
  registrationCode: string = '';

  isLoading = false;

  constructor(
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {}

  volver() {
    this.router.navigate(['/iniciar-sesion']);
  }

async continuar() {

  this.isLoading = true;

  try {

    /**
     * PADRE
     */
    if (this.role === 'padre') {

      const payload = {

        studentId: this.Id,

        registrationCode:
          this.registrationCode

      };

      const res: any = await this.api.post(
        '/auth/validate-student',
        payload
      );

      if (res?.success) {

        this.router.navigate(['/registro2'], {
  state: {
    role: 'padre',
    usuarioId: res.padre.usuario_id,
    registrationCode: this.registrationCode,
    nombre: res.padre.nombre_completo
  }
});

      }

    }

    /**
     * DOCENTE
     */
    if (this.role === 'docente') {

      const payload = {

        docenteId: this.Id,

        registrationCode:
          this.registrationCode

      };

      const res: any = await this.api.post(
        '/auth/validate-docente',
        payload
      );

      if (res?.success) {

        this.router.navigate(['/registro2'], {
  state: {
    role: 'docente',
    usuarioId: res.docente.usuario_id,
    registrationCode: this.registrationCode,
    nombre: res.docente.nombre_completo
  }
});

      }

    }

  } catch (err: any) {

    console.error('FULL ERROR:', err);

    if (err?.error) {

      console.log(
        'SERVER RESPONSE:',
        err.error
      );

      alert(
        err.error?.error?.message ||
        'Información inválida'
      );

    } else {

      alert('Información inválida');

    }

  } finally {

    this.isLoading = false;

  }

}

}