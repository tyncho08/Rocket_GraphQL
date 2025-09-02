import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout()
      });
    }
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => response.token),
        tap(token => {
          this.setToken(token);
          this.loadCurrentUser();
        })
      );
  }

  register(userData: RegisterRequest): Observable<string> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => response.token),
        tap(token => {
          this.setToken(token);
          this.loadCurrentUser();
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.apiUrl}/auth/me`, { headers });
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'Admin';
  }
}