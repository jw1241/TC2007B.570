import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase';
import { StudentService } from '../../services/student';

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

  constructor(
  private router: Router,
  private supabaseService: SupabaseService,
  private studentService: StudentService
) {}

  ngOnInit() {}

  volver() {
    this.router.navigate(['/iniciar-sesion']);
  }

  async continuar() {

  const { data, error } =
    await this.supabaseService.supabase
      .from('alumnos')
      .select('*')
      .eq('matricula', this.studentId)
      .eq('fecha_nacimiento', this.birthDate)
      .eq('codigo_registro', this.registrationCode)
      .single();

  console.log(data);
  console.log(error);

  if (error || !data) {

    alert('Información incorrecta');
    return;

  }

  // SAVE STUDENT HERE
  this.studentService.setAlumno(data);

  console.log(
    this.studentService.getAlumno()
  );

  // Go to next page
  this.router.navigate(['/registro2']);
}

}