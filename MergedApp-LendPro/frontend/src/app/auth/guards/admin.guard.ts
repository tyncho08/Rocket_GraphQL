import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (this.authService.isAuthenticated() && this.authService.isAdmin()) {
      return true;
    }

    if (!this.authService.isAuthenticated()) {
      // Not logged in - redirect to login
      this.router.navigate(['/login']);
    } else {
      // Logged in but not admin - logout and redirect to login
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    
    return false;
  }
}