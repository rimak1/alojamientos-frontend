import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, delay, map, tap, throwError } from 'rxjs';
import type { User, LoginRequest, RegisterRequest, AuthResponse, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://api.alojamientos.com';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  /**
   * Iniciar sesión con email y contraseña
   */
 login(credentials: LoginRequest): Observable<AuthResponse> {
  // Forzamos el tipo literal del rol para que NO se ensanche a 'string'
  const rol: User['rol'] = credentials.email.includes('anfitrion') ? 'ANFITRION' : 'USUARIO';

  const user: User = {
    id: '1',
    nombre: 'Usuario Demo',
    email: credentials.email,
    telefono: '+34 600 000 000',
    rol, // <- ya tipado como 'USUARIO' | 'ANFITRION'
    fechaNacimiento: '1990-01-01',
    fotoUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
  };

  const response: AuthResponse = {
    user,
    token: 'mock-jwt-token-' + Date.now()
  };

  return of(response).pipe(
    delay(800),
    tap((res: AuthResponse) => this.setSession(res))
  );

  // Real:
  // return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, credentials)
  //   .pipe(tap(res => this.setSession(res)));
}

register(userData: RegisterRequest): Observable<AuthResponse> {
  if (userData.email === 'test@existe.com') {
    // Tipo seguro para el throwError
    return throwError(() => new Error('El email ya está registrado'));
  }

  const user: User = {
    id: '2',
    nombre: userData.nombre,
    email: userData.email,
    telefono: userData.telefono,
    rol: userData.rol, // ya es 'USUARIO' | 'ANFITRION'
    fechaNacimiento: userData.fechaNacimiento
  };

  const response: AuthResponse = {
    user,
    token: 'mock-jwt-token-' + Date.now()
  };

  return of(response).pipe(
    delay(1000),
    tap((res: AuthResponse) => this.setSession(res))
  );
}


  /**
   * Solicitar código para restablecer contraseña
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    // Mock implementation
    return of(void 0).pipe(delay(800));
  }

  /**
   * Restablecer contraseña con código
   */
  resetPassword(request: ResetPasswordRequest): Observable<void> {
    // Mock implementation
    return of(void 0).pipe(delay(800));
  }

  /**
   * Cambiar contraseña del usuario autenticado
   */
  changePassword(request: ChangePasswordRequest): Observable<void> {
    // Mock implementation
    return of(void 0).pipe(delay(800));
  }

  /**
   * Obtener perfil del usuario actual
   */
  getProfile(): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return throwError(() => new Error('No user authenticated'));
    }
    return of(currentUser).pipe(delay(500));
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  /**
   * Obtener el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Establecer la sesión del usuario
   */
  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  /**
   * Cargar usuario desde token almacenado
   */
  private loadUserFromToken(): void {
    const token = this.getToken();
    const userData = localStorage.getItem('current_user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        this.logout();
      }
    }
  }
}