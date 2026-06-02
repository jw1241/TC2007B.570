import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from './supabase';

export const authGuard: CanActivateFn = async () => {

  const router = inject(Router);
  const supabase = inject(SupabaseService);

  const { data } =
    await supabase.supabase.auth.getSession();

  if (!data.session) {
    router.navigate(['/iniciar-sesion']);
    return false;
  }

  return true;
};