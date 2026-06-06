import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private async handleRequest<T>(request: Promise<T>): Promise<T> {
    try {
      return await request;
    } catch (error: any) {
      if (error instanceof HttpErrorResponse) {
        throw new Error(error.error?.error?.message || error.error?.message || error.message || 'Request failed');
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.handleRequest(firstValueFrom(this.http.get<T>(`${this.baseUrl}${endpoint}`)));
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return this.handleRequest(firstValueFrom(this.http.post<T>(`${this.baseUrl}${endpoint}`, body)));
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    return this.handleRequest(firstValueFrom(this.http.put<T>(`${this.baseUrl}${endpoint}`, body)));
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.handleRequest(firstValueFrom(this.http.delete<T>(`${this.baseUrl}${endpoint}`)));
  }

  async getBlob(endpoint: string): Promise<Blob> {
    return this.handleRequest(firstValueFrom(this.http.get(`${this.baseUrl}${endpoint}`, { responseType: 'blob' })));
  }

  async createTicket(formData: FormData): Promise<any> {
    return this.handleRequest(firstValueFrom(this.http.post(`${this.baseUrl}/soporte/soporte-ticket`, formData)));
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    return this.handleRequest(firstValueFrom(this.http.post<T>(`${this.baseUrl}${endpoint}`, formData)));
  }
}