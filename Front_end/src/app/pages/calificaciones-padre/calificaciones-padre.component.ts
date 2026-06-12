import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from '../../services/api';
import { StudentService } from '../../services/student';
import { Router } from '@angular/router';

interface BoletaResponse {

  periodo: any;

  materias: {
    materia_id: string;
    nombre_materia: string;

    tareas: {
      nombre: string;
      calificacion: number;
      comentario?: string;
    }[];

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

periodos: any[] = [];

selectedPeriodoId!: string;

  constructor(
    private api: ApiService,
    private router: Router,
    private studentService: StudentService
  ) {}

  async ngOnInit() {

  this.alumno =
    this.studentService.getAlumno();

    console.log(this.alumno);

  if (!this.alumno) {
    this.router.navigate(['/seleccionar-alumno']);
    return;
  }

  this.periodos =
  await this.api.get<any[]>(
    '/padre/periodos'
  );

  if (this.periodos.length) {

    const ultimoPeriodo =
  this.periodos[this.periodos.length - 1];

this.selectedPeriodoId =
  ultimoPeriodo.id;

    await this.loadGrades();
  }
}

async loadGrades() {

  try {

    const res =
      await this.api.get<BoletaResponse>(
        `/padre/${this.alumno.id}/boleta/${this.selectedPeriodoId}`
      );

    this.periodo = res.periodo;
    this.materias = res.materias;
    this.promedio = res.promedio;
    this.boletaDisponible = res.boletaDisponible;
    this.firmada = res.firmada;
    this.fechaFirma = res.fechaFirma;

  } catch (error) {

    console.error(error);

    this.materias = [];
    this.promedio = 0;

  }

}

  async firmarBoleta() {

    await this.api.post(
  `/padre/hijo/${this.alumno.id}/firmar-acuse`,
  {
    periodo_id: this.selectedPeriodoId
  }
);

    await this.loadGrades();

  }

  async viewBoleta() {

  try {

    const blob =
      await this.api.getBlob(
        `/padre/${this.alumno.id}/pdf/${this.selectedPeriodoId}`
      );

    const url =
      window.URL.createObjectURL(blob);

    window.open(url, '_blank');

  } catch (error) {

    console.error(error);

  }

}

  async downloadBoleta() {

  try {

    const blob =
      await this.api.getBlob(
        `/padre/${this.alumno.id}/pdf/${this.selectedPeriodoId}?download=1`
      );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      `boleta-${this.alumno.matricula}.pdf`;

    a.click();

    window.URL.revokeObjectURL(url);

  } catch (error) {

    console.error(error);

  }

}

async onPeriodoChange(event: any) {

  this.selectedPeriodoId =
    event.detail.value;

  await this.loadGrades();
}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

}