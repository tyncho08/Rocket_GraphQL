import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME_QUERY } from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  login(email: string, password: string): Observable<any> {
    return this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password }
    } as any).pipe(
      map(result => (result.data as any)?.login),
      tap(response => {
        if (response?.token && response?.user && !response?.errors) {
          localStorage.setItem('auth_token', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { input: userData }
    } as any).pipe(
      map(result => (result.data as any)?.register),
      tap(response => {
        if (response?.token && response?.user && !response?.errors) {
          localStorage.setItem('auth_token', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.apollo.client.clearStore();
    this.router.navigate(['/login']);
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.apollo.query({
        query: GET_ME_QUERY,
        fetchPolicy: 'network-only'
      }).subscribe({
        next: (result: any) => {
          if (result.data?.me) {
            this.currentUserSubject.next(result.data.me);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  getCurrentUserValue(): any {
    return this.currentUserSubject.value;
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === 'Admin')
    );
  }

  isAdminSync(): boolean {
    const user = this.getCurrentUserValue();
    return user?.role === 'Admin';
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}