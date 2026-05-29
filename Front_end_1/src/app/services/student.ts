import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  selectedAlumno: any = null;

  constructor() {}

  setAlumno(alumno: any) {

    this.selectedAlumno = alumno;

    localStorage.setItem(
      'selectedAlumno',
      JSON.stringify(alumno)
    );
  }

  getAlumno() {

  if (!this.selectedAlumno) {

    const stored =
      localStorage.getItem('selectedAlumno');

    if (stored) {
      this.selectedAlumno = JSON.parse(stored);
    }
  }

  return this.selectedAlumno;
}

  clearAlumno() {

    this.selectedAlumno = null;

    localStorage.removeItem('selectedAlumno');
  }

}