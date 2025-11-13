import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Listing, CreateListingRequest, UpdateListingRequest } from '../models/listing.model';
import type { Pagination } from '../models/common.model';
import { mapAccommodationFromApi, mapAccommodationToApi } from '../mappers/accommodation.mapper';
import { AuthService } from './auth.service';

type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

@Injectable({ providedIn: 'root' })
export class ListingsService {
  private readonly API = `${environment.apiBaseUrl}/accommodation`;

  constructor(private http: HttpClient, private auth: AuthService) { }

  /** Buscar alojamientos con paginación */
  searchListings(_: any, page = 1, pageSize = 10): Observable<Pagination<Listing>> {
    const params = new HttpParams()
      .set('page', String(page - 1))
      .set('size', String(pageSize));

    return this.http.get<SpringPage<any>>(this.API, { params }).pipe(
      map(p => {
        const all = p.content.map(mapAccommodationFromApi);
        const activos = all.filter(l => l.estado === 'ACTIVO'); // 👈 solo activos
        return {
          items: activos,
          page: p.number + 1,
          pageSize: p.size,
          total: activos.length,
          totalPages: Math.max(1, Math.ceil(activos.length / pageSize))
        };
      })
    );
  }

  /**  Obtener alojamiento por ID */
  getListingById(id: string): Observable<Listing> {
    return this.http.get<any>(`${this.API}/${id}`).pipe(map(mapAccommodationFromApi));
  }

  /**  Obtener alojamientos por ciudad */
  getByCity(city: string): Observable<Listing[]> {
    return this.http
      .get<any[]>(`${this.API}/city/${encodeURIComponent(city)}`)
      .pipe(map(arr => arr.map(mapAccommodationFromApi)));
  }

  /**  Crear alojamiento (el backend obtiene el host desde el token JWT) */
  createListing(body: CreateListingRequest): Observable<Listing> {
    const current = this.auth.getCurrentUser();
    if (!current) {
      throw new Error('Usuario no autenticado');
    }

    const hostId = Number(current.id);
    const apiBody = mapAccommodationToApi(body, hostId);

    return this.http.post<any>(this.API, apiBody).pipe(
      map(mapAccommodationFromApi)
    );
  }

  /**  Actualizar alojamiento existente */
  updateListing(req: UpdateListingRequest): Observable<Listing> {
    const current = this.auth.getCurrentUser();
    if (!current) {
      throw new Error('Usuario no autenticado');
    }

    const hostId = Number(current.id);
    const apiBody = mapAccommodationToApi(req, hostId);

    return this.http.put<any>(`${this.API}/${req.id}`, apiBody).pipe(
      map(mapAccommodationFromApi)
    );
  }

  /**  Obtener alojamientos del anfitrión actual */
  getHostListings(): Observable<Listing[]> {
    return this.http
      .get<SpringPage<any>>(`${this.API}/host`)
      .pipe(
        map((p) => (p.content ?? []).map(mapAccommodationFromApi))
      );
  }


  /**  Eliminar alojamiento */
  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  /**  Obtener URL de imagen principal */
  getMainImageUrl(id: string): Observable<string> {
    return this.http.get(`${this.API}/${id}/main-image`, { responseType: 'text' });
  }

  /**  Obtener calificación promedio */
  getAverageRating(id: string): Observable<number> {
    return this.http.get<number>(`${this.API}/${id}/ratings/average`);
  }
}
