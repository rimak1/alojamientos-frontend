export interface Pagination<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages?: number;
}

export interface SearchFilters {
  ciudad?: string;
  fechaInicio?: string;
  fechaFin?: string;
  precioMin?: number;
  precioMax?: number;
  servicios?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}