export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  rol: 'USUARIO' | 'ANFITRION';
  fechaNacimiento: string;
  fotoUrl?: string;
  descripcion?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  rol: 'USUARIO' | 'ANFITRION';
  fechaNacimiento: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  codigo: string;
  nuevaPassword: string;
}

export interface ChangePasswordRequest {
  passwordActual: string;
  nuevaPassword: string;
}