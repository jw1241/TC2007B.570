import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly ALUMNO_STORAGE_KEY = 'alumno:v1';
  private readonly REGISTRATION_CODE_KEY = 'registrationCode:v1';

  private alumno: any = null;
  private registrationCode: string | null = null;

  constructor() {

    const savedAlumno =
      localStorage.getItem(this.ALUMNO_STORAGE_KEY);

    const savedCode =
      localStorage.getItem(this.REGISTRATION_CODE_KEY);

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
      this.ALUMNO_STORAGE_KEY,
      JSON.stringify(alumno)
    );

    localStorage.setItem(
      this.REGISTRATION_CODE_KEY,
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

    localStorage.removeItem(this.ALUMNO_STORAGE_KEY);
    localStorage.removeItem(this.REGISTRATION_CODE_KEY);
  }
}