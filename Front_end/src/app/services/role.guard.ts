import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SupabaseService } from './supabase';
import { ApiService } from './api';
export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {


  const router = inject(Router);
  const supabase = inject(SupabaseService);
  const api = inject(ApiService);

  const allowedRoles = route.data?.['roles'] ?? [];

  const { data: userData } =
    await supabase.supabase.auth.getUser();

  const user = userData?.user;

  if (!user) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  let profile = null;

  try {
    const res = await api.get<any>('/auth/me');
    profile = res.user;
  } catch (err) {
    profile = null;
  }

  if (!profile) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  if (!allowedRoles.includes(profile.rol_id)) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  return true;
};