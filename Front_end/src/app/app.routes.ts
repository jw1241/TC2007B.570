import { Routes } from '@angular/router';

import { authGuard } from './services/auth.guard';
import { roleGuard } from './services/role.guard';

export const routes: Routes = [

  // =========================
  // AUTH PAGES
  // =========================
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./pages/iniciar-sesion/iniciar-sesion.page')
        .then(m => m.IniciarSesionPage)
  },

  {
  path: 'soporte-tecnico',
  loadComponent: () =>
    import('./pages/soporte-tecnico/soporte-tecnico.page')
      .then(m => m.SoporteTecnicoPage)
},

  { 
    path: 'registro', loadComponent: () => 
      import('./pages/registro/registro.page') 
    .then(m => m.RegistroPage) 
  },

  { 
    path: 'registro2', loadComponent: () => 
      import('./pages/registro2/registro2.page') 
    .then(m => m.Registro2Page) 
  },

  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./pages/recuperar-contrasena/recuperar-contrasena.page')
        .then(m => m.RecuperarContrasenaPage)
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password.page')
        .then(m => m.ResetPasswordPage)
  },

  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.page')
        .then(m => m.AuthCallbackPage)
  },

  // =========================
  // ADMIN (ROLE 1)
  // =========================
  {
    path: 'inicio-resumen-administrador',
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] },
    loadComponent: () =>
      import('./pages/inicio-resumen-administrador/inicio-resumen-administrador.page')
        .then(m => m.InicioResumenAdministradorPage)
  },

  {
    path: 'panel-administracion',
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] },
    loadComponent: () =>
      import('./pages/panel-administracion/panel-administracion.page')
        .then(m => m.PanelAdministracionPage)
  },

  // =========================
  // TEACHER (ROLE 2)
  // =========================
  {
    path: 'inicio-resumen-profesor',
    canActivate: [authGuard, roleGuard],
    data: { roles: [2] },
    loadComponent: () =>
      import('./pages/inicio-resumen-profesor/inicio-resumen-profesor.page')
        .then(m => m.InicioResumenProfesorPage)
  },

  {
    path: 'captura-calificaciones',
    canActivate: [authGuard, roleGuard],
    data: { roles: [2] },
    loadComponent: () =>
      import('./pages/captura-calificaciones/captura-calificaciones.page')
        .then(m => m.CapturaCalificacionesPage)
  },

  // =========================
  // PARENT (ROLE 3)
  // =========================
  {
    path: 'inicio-resumen-alumno',
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] },
    loadComponent: () =>
      import('./pages/inicio-resumen-alumno/inicio-resumen-alumno.page')
        .then(m => m.InicioResumenAlumnoPage)
  },

  {
    path: 'seleccionar-alumno',
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] },
    loadComponent: () =>
      import('./pages/seleccionar-alumno/seleccionar-alumno.page')
        .then(m => m.SeleccionarAlumnoPage)
  },

  // =========================
  // SHARED (ANY LOGGED USER)
  // =========================
  {
    path: 'mensajes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/mensajes/mensajes.page')
        .then(m => m.MensajesPage)
  },

  {
    path: 'mensajes-chat',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/parent-mensajes/parent-mensajes.page')
        .then(m => m.ParentMensajesPage)
  },

  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/perfil/perfil.page')
        .then(m => m.PerfilPage)
  },

  // =========================
  // DEFAULT
  // =========================
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full'
  },   

  {
    path: 'calificaciones-padre',
    canActivate: [authGuard, roleGuard],
    data: { roles: [3] },
    loadComponent: () =>
      import('./pages/calificaciones-padre/calificaciones-padre.component')
        .then(m => m.CalificacionesPadrePage)
  },
  {
    path: 'admin-usuario',
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] },
    loadComponent: () =>
      import('./pages/admin-usuario/admin-usuario.component')
        .then(m => m.AdminImportPage)
  },
  {
    path: 'boletas-masivas',
    canActivate: [authGuard, roleGuard],
    data: { roles: [1] },
    loadComponent: () =>
      import('./pages/boletas-masivas/boletas-masivas.component')
        .then(m => m.BoletasMasivasPage)
  }


  
];