import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../domain/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiRequest =
    req.url.startsWith(environment.apiUrl) ||
    req.url.startsWith('/api') ||
    req.url.includes('/api/');

  if (!isApiRequest) {
    return next(req);
  }

  return from(auth.getAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      return next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      );
    })
  );
};
