import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Observable,
  map,
  switchMap,
  forkJoin,
  of
} from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { Booking, CreateBookingRequest, BookingFilters } from '../models/booking.model';
import type { Pagination } from '../models/common.model';
import { mapBookingFromApi, mapBookingToApi } from '../mappers/booking.mapper';
import { AuthService } from './auth.service';

/** Si el backend a veces devuelve Page y otras veces Array, lo normalizamos */
type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página base 0
  size: number;
};

@Injectable({ providedIn: 'root' })
export class BookingsService {
  /** Reservas (huésped / comunes) */
  private readonly API_RES = `${environment.apiBaseUrl}/reservations`;
  /** Endpoints de host autenticado */
  private readonly API_HOST = `${environment.apiBaseUrl}/hosts`;

  private readonly API = `${environment.apiBaseUrl}`;
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  // -----------------------------
  // HUÉSPED (reservas hechas por el usuario autenticado)
  // -----------------------------
  /** Lista de reservas del usuario autenticado (huésped). GET /reservations */
  getBookings(filters: BookingFilters, page = 1, pageSize = 10): Observable<Pagination<Booking>> {
    let params = new HttpParams();

    if (filters?.estado) params = params.set('status', String(filters.estado));
    if (filters?.desde) params = params.set('fechaInicio', filters.desde); // YYYY-MM-DD
    if (filters?.hasta) params = params.set('fechaFin', filters.hasta);     // YYYY-MM-DD

    return this.http.get<SpringPage<any> | any[]>(this.API_RES, { params }).pipe(
      map((raw: any) => {
        // Si es array plano
        if (Array.isArray(raw)) {
          const mapped = raw.map(mapBookingFromApi);
          const start = (page - 1) * pageSize;
          const items = mapped.slice(start, start + pageSize);
          return {
            items,
            page,
            pageSize,
            total: mapped.length,
            totalPages: Math.max(1, Math.ceil(mapped.length / pageSize))
          } as Pagination<Booking>;
        }

        // Si es Page
        const p = raw as SpringPage<any>;
        return {
          items: (p.content ?? []).map(mapBookingFromApi),
          page: (p.number ?? 0) + 1,
          pageSize: p.size ?? pageSize,
          total: p.totalElements ?? (p.content?.length ?? 0),
          totalPages: p.totalPages ?? 1
        } as Pagination<Booking>;
      })
    );
  }

  /** Detalle por id */
  getBookingById(id: string): Observable<Booking> {
    return this.http
      .get<any>(`${this.API_RES}/${id}`)
      .pipe(map(mapBookingFromApi));
  }

  /** Crear reserva: si no pasas guestId, toma el del usuario logueado */
  createBooking(body: CreateBookingRequest, guestId?: number): Observable<Booking> {
    const current = this.auth.getCurrentUser();
    const effectiveGuestId = guestId ?? (current ? Number(current.id) : undefined);

    // mapBookingToApi si tu back exige el shape del DTO
    const apiBody = mapBookingToApi(
      { ...body } as any,
      effectiveGuestId as number
    );

    return this.http
      .post<any>(this.API_RES, apiBody)
      .pipe(map(mapBookingFromApi));
  }

  /** Actualizar (si lo necesitas) */
  updateBooking(id: string, body: Partial<CreateBookingRequest>, guestId: number): Observable<Booking> {
    const apiBody = mapBookingToApi(body as any, guestId);
    return this.http
      .put<any>(`${this.API_RES}/${id}`, apiBody)
      .pipe(map(mapBookingFromApi));
  }

  /** Cancelar: algunos backends aceptan body en DELETE; si no, ajusta a PUT /{id}/cancel */
  cancelBooking(id: string, reasonCancellation?: string): Observable<Booking> {
    return this.http
      .request<any>('DELETE', `${this.API_RES}/${id}`, {
        body: reasonCancellation ? { reasonCancellation } : {}
      })
      .pipe(map(mapBookingFromApi));
  }

  /** Marcar completada (si existe en tu back) */
  markCompleted(id: string): Observable<Booking> {
    return this.http
      .post<any>(`${this.API_RES}/${id}/complete`, {})
      .pipe(map(mapBookingFromApi));
  }

  // -----------------------------
  // ANFITRIÓN (reservas de sus alojamientos)
  // -----------------------------
  /** Todas las reservas de un alojamiento. GET /reservations/accommodation/{id} */
  getByAccommodation(accommodationId: string): Observable<Booking[]> {
    return this.http
      .get<any[]>(`${this.API_RES}/accommodation/${accommodationId}`)
      .pipe(map(arr => arr.map(mapBookingFromApi)));
  }

  /** Alias por compatibilidad con algunos componentes */
  getBookingsByAccommodation(accommodationId: string): Observable<Booking[]> {
    return this.getByAccommodation(accommodationId);
  }

  /**
   * (Opcional) Traer TODAS las reservas de TODOS los alojamientos del host autenticado.
   * Hace:
   *   GET /hosts/me/accommodations  -> saca ids
   *   GET /reservations/accommodation/{id} por cada uno
   * y agrupa en un solo array.
   */
  getAllHostBookingsAggregated(): Observable<Booking[]> {
    return this.http.get<any>(`${this.API_HOST}/me/accommodations`).pipe(
      map((raw: any) => {
        // Puede venir como {content: []} o {items: []} o directamente []
        const list = (raw?.content ?? raw?.items ?? raw ?? []) as Array<{ id: string | number }>;
        return list.map(a => String((a as any).id));
      }),
      switchMap((accIds: string[]) => {
        if (!accIds.length) return of([] as Booking[][]);
        return forkJoin(accIds.map(id => this.getByAccommodation(id)));
      }),
      map((chunks) => chunks.flat()) // Booking[]
    );
  }
  getMyBookings(
    filters: BookingFilters = {},
    page = 1,
    pageSize = 10
  ): Observable<Pagination<Booking>> {
    const user = this.auth.getCurrentUser();
    if (!user) throw new Error('No autenticado');

    // 1) Huésped: usa endpoint de reservas por huésped
    if (user.rol === 'USUARIO') {
      let params = new HttpParams();
      if (filters.estado) params = params.set('status', String(filters.estado));
      if (filters.desde) params = params.set('fechaInicio', filters.desde);
      if (filters.hasta) params = params.set('fechaFin', filters.hasta);
      params = params
        .set('page', String(page - 1))
        .set('size', String(pageSize));

      return this.http
        .get<SpringPage<any>>(`${this.API_RES}/guest/${user.id}`, { params })
        .pipe(
          map((p) => ({
            items: (p.content ?? []).map(mapBookingFromApi),
            page: (p.number ?? 0) + 1,
            pageSize: p.size ?? pageSize,
            total: p.totalElements ?? (p.content?.length ?? 0),
            totalPages: p.totalPages ?? 1
          }))
        );
    }

    // 2) Anfitrión: usar las reservas de TODOS sus alojamientos
    return this.getAllHostBookingsAggregated().pipe(
      map((all) => {
        // Filtros en el frontend
        let filtered = [...all];

        if (filters.estado) {
          filtered = filtered.filter(
            (b) => b.estado === filters.estado
          );
        }

        if (filters.desde) {
          const from = new Date(filters.desde);
          filtered = filtered.filter(
            (b) => new Date(b.checkIn) >= from
          );
        }

        if (filters.hasta) {
          const to = new Date(filters.hasta);
          filtered = filtered.filter(
            (b) => new Date(b.checkOut) <= to
          );
        }

        const total = filtered.length;
        const start = (page - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        return {
          items,
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize))
        } as Pagination<Booking>;
      })
    );
  }



  // -----------------------------
  // Utilidades
  // -----------------------------
  /** Fechas ocupadas de un alojamiento generadas a partir de sus reservas */
  getOccupiedDates(accommodationId: string): Observable<string[]> {
    return this.getByAccommodation(accommodationId).pipe(
      map((bookings) => {
        const days: string[] = [];
        bookings.forEach(b => {
          const start = new Date(b.checkIn);
          const end = new Date(b.checkOut);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(d.toISOString().slice(0, 10));
          }
        });
        // único
        return Array.from(new Set(days));
      })
    );
  }

  /** (Opcional) Cambiar estado si tu back lo soporta: PUT /reservations/{id}/state?state=... */
  changeState(id: string, state: 'CONFIRMED' | 'CANCELED' | 'PAID', reason?: string): Observable<void> {
    let params = new HttpParams().set('state', state);
    if (reason) params = params.set('reason', reason);
    return this.http.put<void>(`${this.API_RES}/${id}/state`, {}, { params });
  }
}
