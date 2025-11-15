import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'admin' | 'prof' | 'adherent';
  salleId: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3001';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          this.currentUserSubject.next(JSON.parse(stored));
        } catch {
          localStorage.removeItem('currentUser');
        }
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http
      .get<User[]>(`${this.API_URL}/users`, { params })
      .pipe(
        map((users) => {
          if (!users || users.length === 0) {
            throw new Error('Identifiants invalides');
          }
          const user = users[0];
          this.currentUserSubject.next(user);
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          return user;
        })
      );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  /* ==== Helpers de rôles ==== */

  getRole(): User['role'] | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  hasRole(roles: User['role'][]): boolean {
    const role = this.getRole();
    return !!role && roles.includes(role);
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isProf(): boolean {
    return this.getRole() === 'prof';
  }

  isAdherent(): boolean {
    return this.getRole() === 'adherent';
  }
}
