import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {

  private baseUrl = '/api/teacher';

  constructor(private http: HttpClient) {}

  // 👨‍🏫 Grupos del docente
  getGrupos(docenteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${docenteId}/grupos`);
  }

  // 📚 Materias asignadas
  getMaterias(docenteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${docenteId}/materias`);
  }

  // 📊 Calificaciones recientes
  getCalificacionesRecientes(docenteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${docenteId}/calificaciones-recientes`);
  }

  // 💬 Mensajes recientes
  getMensajes(docenteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${docenteId}/mensajes`);
  }

  // 🔔 KPIs resumen
  getResumen(docenteId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${docenteId}/resumen`);
  }

  getProfile(id: string) {
  if (!id) throw new Error('docenteId is required');
  return this.http.get(`/api/docente/${id}/profile`);
}
  
}