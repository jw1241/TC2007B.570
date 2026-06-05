import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {}

  private async getToken(): Promise<string | undefined> {

    const { data } =
      await this.supabase.supabase.auth.getSession();

    return data.session?.access_token;

  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {

    const token =
  await this.getToken();

console.log(
  'ACCESS TOKEN:',
  token
);

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        15000
      );

    try {

      const response =
        await fetch(
          `${this.baseUrl}${endpoint}`,
          {
            ...options,
            signal: controller.signal,
            headers: {
              ...(options.headers || {}),
              ...(token && {
                Authorization:
                  `Bearer ${token}`
              })
            }
          }
        );

      let data: any = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        throw new Error(
          data?.error?.message ||
          `Request failed (${response.status})`
        );

      }

      return data;

    } finally {

      clearTimeout(timeout);

    }

  }

  async get<T>(
    endpoint: string
  ): Promise<T> {

    return this.request(
  endpoint,
  {
    method: 'GET',
    headers: {
      'Content-Type':
        'application/json'
    }
  }
) as Promise<T>;

  }

  async post<T>(
    endpoint: string,
    body: any
  ): Promise<T> {

    return this.request(
      endpoint,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify(body)
      }
    );

  }

  async put<T>(
    endpoint: string,
    body: any
  ): Promise<T> {

    return this.request(
      endpoint,
      {
        method: 'PUT',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify(body)
      }
    );

  }

  async delete<T>(
    endpoint: string
  ): Promise<T> {

    return this.request(
      endpoint,
      {
        method: 'DELETE'
      }
    );

  }

  async getBlob(endpoint: string): Promise<Blob> {

  const token = await this.getToken();

  const response = await fetch(
    `${this.baseUrl}${endpoint}`,
    {
      method: 'GET',
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`
        })
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status})`
    );
  }

  return response.blob();
}

  async createTicket(
    formData: FormData
  ): Promise<any> {

    const token =
      await this.getToken();

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        15000
      );

    try {

      const response =
        await fetch(
          `${this.baseUrl}/soporte/soporte-ticket`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              ...(token && {
                Authorization:
                  `Bearer ${token}`
              })
            },
            body: formData
          }
        );

      let data: any = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        throw new Error(
          data?.error?.message ||
          `Ticket creation failed (${response.status})`
        );

      }

      return data;

    } finally {

      clearTimeout(timeout);

    }

  }
  async upload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {

  const token = await this.getToken();

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    15000
  );

  try {

    const response = await fetch(
      `${this.baseUrl}${endpoint}`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...(token && {
            Authorization: `Bearer ${token}`
          })
          // ❌ DO NOT set Content-Type here
        },
        body: formData
      }
    );

    let data: any = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error?.message ||
        `Upload failed (${response.status})`
      );
    }

    return data;

  } finally {
    clearTimeout(timeout);
  }
}
  

}