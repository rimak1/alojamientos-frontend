// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

import type {
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
  RequestPasswordReset,
  VerifyPasswordReset
} from '../models/user.model';

import { mapUserFromApi } from '../mappers/user.mapper';

// Respuesta del login según tu LoginResponseDto (back)
type LoginResponseDto = { id: number; email: string; fullName: string; userType?: 'GUEST' | 'HOST'; photoProfile?: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly API = environment.apiBaseUrl; // '/api/v1'

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  /** Conveniencia para tu LoginComponent actual (por defecto GUEST) */
  login(credentials: LoginRequest): Observable<User> {
    return this.loginGuest(credentials);
  }

  /** /api/v1/auth/guest/login */
  loginGuest(credentials: LoginRequest): Observable<User> {
    const url = `${this.API}/auth/guest/login`;
    return this.http.post<LoginResponseDto>(url, credentials, { observe: 'response' })
      .pipe(map((res: HttpResponse<LoginResponseDto>) => this.handleLoginResponse(res, 'USUARIO')));
  }

  /** /api/v1/auth/host/login */
  loginHost(credentials: { email: string; password: string; }) {
    return this.http.post<LoginResponseDto>(
      `${environment.apiBaseUrl}/auth/host/login`,
      credentials,
      { observe: 'response' }
    ).pipe(map((res) => this.handleLoginResponse(res, 'ANFITRION')));
  }

  /** /api/v1/auth/logout (el back invalida el token si aplica) */
  logout(): Observable<void> {
    const url = `${this.API}/auth/logout`;
    return this.http.post<void>(url, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  // Reciben el RegisterRequest del front (nombre, telefono, fechaNacimiento...)
  registerGuest(form: RegisterRequest) {
    const body = {
      name: form.nombre,
      email: form.email,
      password: form.password,
      phone: form.telefono,
      dateBirth: form.fechaNacimiento,
      photoProfile: '' // opcional
    };
    return this.http.post<User>(`${environment.apiBaseUrl}/guests`, body);
  }

  registerHost(form: RegisterRequest) {
    const body = {
      name: form.nombre,
      email: form.email,
      password: form.password,
      phone: form.telefono,
      dateBirth: form.fechaNacimiento,
      photoProfile: '' // opcional
    };
    return this.http.post<User>(`${environment.apiBaseUrl}/hosts`, body);
  }


  /** Perfil actual (elige guests/hosts por rol desde storage) */
  getProfile(): Observable<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Usuario no autenticado');

    const endpoint =
      current.rol === 'ANFITRION' ? `${this.API}/hosts/me` : `${this.API}/guests/me`;

    return this.http.get<any>(endpoint).pipe(
      map(api => this.mapProfileToUser(api, current.rol)),
      tap(user => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /** Actualizar perfil (PUT /me) */
  updateProfile(data: { nombre: string; telefono: string; fotoUrl?: string }): Observable<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('Usuario no autenticado');

    const endpoint =
      current.rol === 'ANFITRION' ? `${this.API}/hosts/me` : `${this.API}/guests/me`;

    const body = {
      name: data.nombre,
      phone: data.telefono,
      photoProfile: data.fotoUrl || ''
    };

    return this.http.put<any>(endpoint, body).pipe(
      map(api => this.mapProfileToUser(api, current.rol)),
      tap(user => {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  /** Cambiar password (PUT /me/password) */
  changeMyGuestPassword(body: ChangePasswordRequest) {
    return this.http.put<void>(`${this.API}/guests/me/password`, body);
  }
  changeMyHostPassword(body: ChangePasswordRequest) {
    return this.http.put<void>(`${this.API}/hosts/me/password`, body);
  }

  /** Flujo de recuperación de contraseña (si tu back lo expone) */
  forgotPassword(body: RequestPasswordReset) {
    // Ajusta la ruta si tu back expone otras paths
    return this.http.post<void>(`${this.API}/password-reset/request`, body);
  }
  resetPassword(body: VerifyPasswordReset) {
    return this.http.post<void>(`${this.API}/password-reset/verify`, body);
  }

  /** Helpers de sesión */
  isAuthenticated() { return !!this.getToken() && !!this.currentUserSubject.value; }
  getToken() { return localStorage.getItem('auth_token'); }
  getCurrentUser() { return this.currentUserSubject.value; }

  /** Lee Authorization: Bearer ... + mapea body a User y guarda sesión */
  private handleLoginResponse(res: HttpResponse<LoginResponseDto>, rol: User['rol']): User {
    const rawAuth = res.headers.get('Authorization') ?? res.headers.get('authorization') ?? '';
    const token = rawAuth.replace(/^Bearer\s+/i, '');
    if (!token || !res.body) throw new Error('No se recibió token');

    // Puedes usar tu mapper central o mapear aquí directamente:
    const user = mapUserFromApi(
      {
        id: res.body.id,
        email: res.body.email,
        fullName: res.body.fullName,
        photoProfile: res.body.photoProfile
      },
      rol
    );

    this.setSession(token, user);
    return user;
  }

  private setSession(token: string, user: User) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage() {
    const t = this.getToken();
    const raw = localStorage.getItem('current_user');
    if (t && raw) {
      try {
        this.currentUserSubject.next(JSON.parse(raw) as User);
      } catch {
        this.clearSession();
      }
    }
  }

  /** Normaliza cualquier DTO de perfil a tu modelo User */
  private mapProfileToUser(api: any, rol: User['rol']): User {
    return {
      id: String(api.id),
      nombre: api.name,
      email: api.email,
      telefono: api.phone,
      rol,
      fotoUrl: api.photoProfile,
      fechaNacimiento: api.dateBirth,
    };
  }

  public forceLocalLogout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this['currentUserSubject']?.next(null); // o this.currentUserSubject.next(null) si es accesible
  }

}
