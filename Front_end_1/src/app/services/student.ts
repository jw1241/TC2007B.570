import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private alumno: any = null;
  private registrationCode: string | null = null;

  constructor() {

    // restore from localStorage on refresh
    const savedAlumno =
      localStorage.getItem('alumno');

    const savedCode =
      localStorage.getItem('registrationCode');

    if (savedAlumno) {
      this.alumno = JSON.parse(savedAlumno);
    }

    if (savedCode) {
      this.registrationCode = savedCode;
    }

  }

  setAlumno(alumno: any, registrationCode: string) {

    this.alumno = alumno;
    this.registrationCode = registrationCode;

    localStorage.setItem(
      'alumno',
      JSON.stringify(alumno)
    );

    localStorage.setItem(
      'registrationCode',
      registrationCode
    );

  }

  getAlumno() {
    return this.alumno;
  }

  getRegistrationCode() {
    return this.registrationCode;
  }

  clear() {

    this.alumno = null;
    this.registrationCode = null;

    localStorage.removeItem('alumno');
    localStorage.removeItem('registrationCode');

  }

}