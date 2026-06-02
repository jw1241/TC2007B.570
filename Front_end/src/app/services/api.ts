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


async createTicket(formData: FormData) {

  const token = await this.getToken();

  const response = await fetch(
    `${this.baseUrl}/soporte/soporte-ticket`,
    {
      method: 'POST',
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      },
      body: formData
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || 'Ticket creation failed'
    );
  }

  return data;
}
}