import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Add JWT token to requests if available
    const token = this.authService.getToken();
    
    if (token && this.authService.isAuthenticated()) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid - logout user
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - redirect to unauthorized page or home
          this.router.navigate(['/']);
        }
        
        return throwError(() => error);
      })
    );
  }
}