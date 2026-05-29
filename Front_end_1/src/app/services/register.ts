import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

  constructor(private http: HttpClient) {}

  validateStudent(payload: any): Observable<any> {
    return this.http.post(
      `${environment.apiUrl}/register/validate-student`,
      payload
    );
  }
}