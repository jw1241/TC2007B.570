import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener el token del LocalStorage (donde lo guarda el AuthService al hacer login)
  const token = localStorage.getItem('token');

  // Clonar la petición y agregar el header Authorization si hay token
  if (token) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  // Si no hay token, la petición pasa tal cual
  return next(req);
};
