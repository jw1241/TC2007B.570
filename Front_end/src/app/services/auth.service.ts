import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase';

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private router: Router,
    private supabase: SupabaseService
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
  const { data: profile } = await this.supabase.supabase
    .from('usuarios')
    .select('id')
    .eq('auth_user_id', data.user.id)
    .maybeSingle();

  if (profile) {
    localStorage.setItem('user_id', profile.id); // ✅ THIS is correct ID
  }

  return {
    success: true,
    user: data.user,
    profile
  };
}

  async getUsuario() {
    const { data } =
      await this.supabase.supabase.auth.getUser();

      if (data.user) {
  localStorage.setItem('user_id', data.user.id);
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

  /**
   * GET AUTH USER
   */
  const {
    data: { user }
  } =
    await this.supabase
      .supabase
      .auth
      .getUser();

  if (!user) return null;

  /**
   * FIND usuario PROFILE
   * USING auth_user_id
   */
  const {
    data,
    error
  } =
    await this.supabase
      .supabase
      .from('usuarios')
      .select('*')
      .eq(
        'auth_user_id',
        user.id
      )
      .eq('activo', true)
      .maybeSingle();

  

  if (error) {

    console.error(
      'PROFILE ERROR:',
      error
    );

    return null;

  }

  return data;

}
}