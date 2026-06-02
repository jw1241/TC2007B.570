import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { SupabaseService } from './supabase';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {

  const router = inject(Router);
  const supabase = inject(SupabaseService);

  const allowedRoles = route.data?.['roles'] ?? [];

  const { data: userData } =
    await supabase.supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  const { data: profile } =
    await supabase.supabase
      .from('usuarios')
      .select('rol_id')
      .eq('auth_user_id', user.id)
      .single();

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