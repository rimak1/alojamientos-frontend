import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import type { Booking, CreateBookingRequest, BookingFilters } from '../models/booking.model';
import type { Pagination } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private readonly API_URL = 'https://api.alojamientos.com';

  constructor(private http: HttpClient) {}

  /**
   * Crear nueva reserva
   */
  createBooking(bookingData: CreateBookingRequest): Observable<Booking> {
    const mockBooking: Booking = {
      id: Date.now().toString(),
      ...bookingData,
      usuarioId: '1',
      estado: 'PENDIENTE',
      creadoEn: new Date().toISOString(),
      alojamiento: {
        titulo: 'Apartamento moderno en el centro',
        ciudad: 'Madrid',
        precioNoche: 89,
        imagenPrincipal: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    };

    return of(mockBooking).pipe(delay(1000));
  }

  /**
   * Obtener reservas con filtros
   */
  getBookings(filters: BookingFilters, page: number = 1, pageSize: number = 10): Observable<Pagination<Booking>> {
    const mockBookings: Booking[] = [
      {
        id: '1',
        alojamientoId: '1',
        usuarioId: '1',
        checkIn: '2025-03-15',
        checkOut: '2025-03-18',
        huespedes: 2,
        estado: 'CONFIRMADA',
        creadoEn: '2025-01-20T10:00:00Z',
        alojamiento: {
          titulo: 'Apartamento moderno en el centro',
          ciudad: 'Madrid',
          precioNoche: 89,
          imagenPrincipal: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400'
        }
      }
    ];

    // Apply filters
    let filteredBookings = mockBookings;
    if (filters.estado) {
      filteredBookings = filteredBookings.filter(booking => booking.estado === filters.estado);
    }

    const startIndex = (page - 1) * pageSize;
    const items = filteredBookings.slice(startIndex, startIndex + pageSize);

    return of({
      items,
      page,
      pageSize,
      total: filteredBookings.length,
      totalPages: Math.ceil(filteredBookings.length / pageSize)
    }).pipe(delay(500));
  }

  /**
   * Cancelar reserva
   */
  cancelBooking(id: string): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  /**
   * Verificar disponibilidad de fechas
   */
  checkAvailability(alojamientoId: string, checkIn: string, checkOut: string): Observable<boolean> {
    return of(true).pipe(delay(400));
  }

  /**
   * Obtener fechas ocupadas para calendario
   */
  getOccupiedDates(alojamientoId: string): Observable<string[]> {
    const mockOccupiedDates = [
      '2025-01-25', '2025-01-26', '2025-01-27',
      '2025-02-10', '2025-02-11', '2025-02-12', '2025-02-13'
    ];
    
    return of(mockOccupiedDates).pipe(delay(300));
  }
}