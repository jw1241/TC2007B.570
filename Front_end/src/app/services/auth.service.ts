import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';
import { ApiService } from './api';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private api: ApiService
  ) {}

  async login(email: string, password: string) {

  const { data, error } =
    await this.supabase.supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data.user) return { success: false };

  // 🔥 GET PROFILE (IMPORTANT)
  try {
    const profileRes = await this.api.get<any>('/auth/me');
    const profile = profileRes.user;

    if (profile) {
      localStorage.setItem('user_id', profile.id); // ✅ THIS is correct ID
    }

    return {
      success: true,
      user: data.user,
      profile
    };
  } catch (err) {
    return {
      success: true,
      user: data.user,
      profile: null
    };
  }
}

  async getUsuario() {
    const { data } =
      await this.supabase.supabase.auth.getUser();

      if (data.user) {
  localStorage.setItem('auth_user_id', data.user.id);
}

    return data.user;
  }

  async logout() {
    await this.supabase.supabase.auth.signOut();

    this.router.navigate(['/iniciar-sesion'], {
      replaceUrl: true
    });
  }

  async redirectByRole(roleId: number) {

    switch (roleId) {
      case 1:
        return this.router.navigate(['/inicio-resumen-administrador']);
      case 2:
        return this.router.navigate(['/inicio-resumen-profesor']);
      case 3:
        return this.router.navigate(['/seleccionar-alumno']);
      default:
        return this.router.navigate(['/iniciar-sesion']);
    }
  }
  
async getProfile() {
  try {
    const res = await this.api.get<any>('/auth/me');
    return res.user || null;
  } catch (err) {
    console.error('PROFILE ERROR:', err);
    return null;
  }
}
}