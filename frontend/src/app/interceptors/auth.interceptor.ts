import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Если токен есть — клонируем запрос и добавляем Authorization header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(authReq); // Отправляем изменённый запрос
  }

  // Если токена нет — отправляем запрос как есть (для login/register)
  return next(req);
};