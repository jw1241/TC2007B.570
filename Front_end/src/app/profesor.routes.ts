import { Routes } from '@angular/router';

export const PROFESOR_ROUTES: Routes = [

  {
    path: '',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },

  {
    path: 'inicio',
    loadComponent: () =>
      import('./pages/inicio-resumen-profesor/inicio-resumen-profesor.page')
        .then(m => m.InicioResumenProfesorPage)
  },
];