import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { StudentService } from '../../services/student';
import { Router } from '@angular/router';

interface BoletaResponse {

  periodo: any;

  materias: {
    nombre_materia: string;
    promedio: number;
  }[];

  promedio: number;

  boletaDisponible: boolean;

  firmada: boolean;

  fechaFirma: string | null;
}

@Component({
  selector: 'app-calificaciones-padre',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ],
  templateUrl: './calificaciones-padre.component.html'
})
export class CalificacionesPadrePage implements OnInit {

  alumno: any;
  periodo: any;

  materias: any[] = [];

  promedio = 0;

  boletaDisponible = false;

  firmada = false;

  fechaFirma: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private studentService: StudentService
  ) {}

  async ngOnInit() {

  this.alumno =
    this.studentService.getAlumno();

  if (!this.alumno) {
    this.router.navigate(['/seleccionar-alumno']);
    return;
  }

  await this.loadGrades();
}

  async loadGrades() {

  const res = await this.api.get<BoletaResponse>(
    `/grades/${this.alumno.id}/boleta`
  );

  this.periodo = res.periodo;

  this.materias = res.materias;

  this.promedio = res.promedio;

  this.boletaDisponible = res.boletaDisponible;

  this.firmada = res.firmada;

  this.fechaFirma = res.fechaFirma;
}

  async firmarBoleta() {

    await this.api.post(
      `/boletas/${this.alumno.id}/sign`,
      {}
    );

    await this.loadGrades();

  }

  viewBoleta() {

    window.open(
      `/api/boletas/${this.alumno.id}/pdf`,
      '_blank'
    );

  }

  downloadBoleta() {

    window.open(
      `/api/boletas/${this.alumno.id}/pdf?download=1`,
      '_blank'
    );

  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}