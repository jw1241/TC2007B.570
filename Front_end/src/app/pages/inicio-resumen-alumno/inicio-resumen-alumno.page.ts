import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

import { StudentService } from '../../services/student';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';

interface StudentSummary {
  alumno: any;
  padre: any;

  resumen: {
    promedio: number;
    totalMaterias: number;
    mejorMateria: {
      materia_id: string;
      nombre_materia: string;
      promedio: number;
    };
    peorMateria: {
      materia_id: string;
      nombre_materia: string;
      promedio: number;
    };
  };

  materias: any[];
}

@Component({
  selector: 'app-inicio-resumen-alumno',
  templateUrl: './inicio-resumen-alumno.page.html',
  styleUrls: ['./inicio-resumen-alumno.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonSpinner,
    CommonModule,
    FormsModule
  ]
})
export class InicioResumenAlumnoPage
  implements OnInit {

  alumno: any = null;

  padre: any = null;

  materias: any[] = [];

  promedio = 0;

  totalMaterias = 0;

  mejorMateria: any = null;

  peorMateria: any = null;

  isLoading = false;

  errorMessage = '';

  constructor(
    private router: Router,
    private studentService: StudentService,
    private api: ApiService,
    private authService: AuthService
  ) {}

  async ngOnInit() {

    this.alumno =
      this.studentService.getAlumno();
    

    if (!this.alumno) {

      this.router.navigate([
        '/seleccionar-alumno'
      ]);

      return;

    }

    await this.loadSummary();

  }

  async loadSummary() {

    try {

      this.isLoading = true;

      this.errorMessage = '';

      const summary =
        await this.api.get<StudentSummary>(
          `/grades/${this.alumno.id}/summary`
        );

      console.log(
        'SUMMARY RESPONSE:',
        summary
      );

      if (!summary?.alumno) {

        this.router.navigate([
          '/seleccionar-alumno'
        ]);

        return;

      }

      this.alumno = {
        ...this.alumno,
        ...summary.alumno
      };
      console.log('SELECTED STUDENT', this.alumno);

      this.padre =
        summary.padre;

      this.materias =
  summary.materias || [];

  this.mejorMateria = summary.resumen?.mejorMateria || null;
this.peorMateria = summary.resumen?.peorMateria || null;

      this.promedio =
        summary.resumen?.promedio || 0;

      this.totalMaterias =
  summary.resumen?.totalMaterias || this.materias.length;

    } catch (err) {

      console.error(
        'LOAD SUMMARY ERROR:',
        err
      );

      this.errorMessage =
        'No se pudo cargar la información del alumno';

      this.padre = null;

      this.materias = [];

      this.promedio = 0;

      this.totalMaterias = 0;

      this.mejorMateria = null;

      this.peorMateria = null;

    } finally {

      this.isLoading = false;

    }

  }

  async refresh(event?: any) {

    await this.loadSummary();

    event?.target?.complete();

  }

  navigateTo(path: string) {

    this.router.navigate([
      path
    ]);

  }

  async logout() {
    await this.authService.logout();
  }

}