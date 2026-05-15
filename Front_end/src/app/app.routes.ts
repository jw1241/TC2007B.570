import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./pages/iniciar-sesion/iniciar-sesion.page').then((m) => m.IniciarSesionPage),
  },
  {
    path: 'seleccionar-alumno',
    loadComponent: () => import('./pages/seleccionar-alumno/seleccionar-alumno.page').then((m) => m.SeleccionarAlumnoPage),
  },
  {
    path: 'inicio-resumen',
    loadComponent: () => import('./pages/inicio-resumen/inicio-resumen.page').then((m) => m.InicioResumenPage),
  },
  {
    path: 'boleta',
    loadComponent: () => import('./pages/boleta/boleta.page').then((m) => m.BoletaPage),
  },
  {
    path: 'mensajes',
    loadComponent: () => import('./pages/mensajes/mensajes.page').then((m) => m.MensajesPage),
  },
  {
    path: 'mensajes-chat',
    loadComponent: () => import('./pages/mensajes-chat/mensajes-chat.page').then((m) => m.MensajesChatPage),
  },
  {
    path: 'inicio-resumen-alumno',
    loadComponent: () => import('./pages/inicio-resumen-alumno/inicio-resumen-alumno.page').then((m) => m.InicioResumenAlumnoPage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage),
  },
  {
    path: '',
    redirectTo: 'iniciar-sesion',
    pathMatch: 'full',
  },
];
