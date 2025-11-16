import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      const status = error?.status;

      //  Error de red / CORS / servidor caído
      if (status === 0) {
        toastService.showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      }
      //  Petición inválida (validaciones de back)
      else if (status === 400) {
        const msg = error?.error?.message || error?.error?.mensaje || 'Petición inválida. Revisa los datos enviados.';
        toastService.showError(msg);
      }
      //  No autenticado → sesión expirada / token inválido
      else if (status === 401) {
        toastService.showError('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        authService.forceLocalLogout();           // limpiamos solo en front
        router.navigate(['/auth/login']);         // te llevo al login, no a inicio
      }
      //  Prohibido
      else if (status === 403) {
        toastService.showError('No tienes permisos para realizar esta acción.');
      }
      //  No encontrado
      else if (status === 404) {
        toastService.showError('Recurso no encontrado.');
      }
      //  Errores 5xx del servidor
      else if (status >= 500) {
        toastService.showError('Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.');
      }

      return throwError(() => error);
    })
  );
};
