// import { Injectable } from '@angular/core';
// import { SupabaseService } from './supabase';

// @Injectable({ providedIn: 'root' })
// export class ApiService {

//   private baseUrl = 'http://localhost:3000/api';

//   constructor(private supabase: SupabaseService) {}

//   private async getToken() {
//     const { data } =
//       await this.supabase.supabase.auth.getSession();

//     return data.session?.access_token;
//   }

//   async get(endpoint: string) {

//     const token = await this.getToken();

//     const response = await fetch(`${this.baseUrl}${endpoint}`, {
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` })
//       }
//     });

//     return response.json();
//   }

//   async post(endpoint: string, body: any) {

//     const token = await this.getToken();

//     const response = await fetch(`${this.baseUrl}${endpoint}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         ...(token && { Authorization: `Bearer ${token}` })
//       },
//       body: JSON.stringify(body)
//     });

//     return response.json();
//   }
// }

import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private supabase: SupabaseService) {}

  private async getToken() {
    const { data } = await this.supabase.supabase.auth.getSession();
    return data.session?.access_token;
  }

  async get(endpoint: string) {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'GET failed');
    }

    return data;
  }

  async post(endpoint: string, body: any) {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'POST failed');
    }

    return data;
  }
  async validateAlumno(body: any) {
  return await this.post('/validate-student', body);
}

async validateDocente(body: any) {
  return await this.post('/validate-docente', body);
}

async sorporteAlumno(body: any) {
  return await this.post('/sorporte-alumno', body);
}

async sorporteDocente(body: any) {
  return await this.post('/sorporte-docente', body);
}

async createTicket(body: any) {
  return await this.post('/tickets/create', body);
}
}