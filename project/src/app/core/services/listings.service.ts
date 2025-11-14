import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import type { Listing, CreateListingRequest, UpdateListingRequest } from '../models/listing.model';
import type { Pagination } from '../models/common.model';
import { mapAccommodationFromApi, mapAccommodationToApi } from '../mappers/accommodation.mapper';
import { AuthService } from './auth.service';
import type { SearchFilters } from '../models/common.model';


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

    private readonly API_BASE = `${environment.apiBaseUrl}`;
  private readonly API_ACCOMMODATIONS = `${this.API_BASE}/accommodation`;
  constructor(private http: HttpClient, private auth: AuthService) { }

  /**
   * Buscar alojamientos desde el backend (paginado).
   * Los filtros complejos los aplicaremos en el frontend.
   */
 searchListings(
    filters: SearchFilters,
    page = 1,
    pageSize = 10
  ): Observable<Pagination<Listing>> {
    let params = new HttpParams()
      .set('page', String(page - 1))   // backend usa base 0
      .set('size', String(pageSize));

    // Si luego quieres mandar ciudad al back:
    // if (filters?.ciudad) {
    //   params = params.set('city', filters.ciudad);
    // }

    return this.http
      .get<SpringPage<any>>(this.API_ACCOMMODATIONS, { params })
      .pipe(
        map(p => ({
          items: (p.content ?? []).map(mapAccommodationFromApi),
          page: (p.number ?? 0) + 1,
          pageSize: p.size ?? pageSize,
          total: p.totalElements ?? (p.content?.length ?? 0),
          totalPages: p.totalPages ?? 1
        }))
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
  getHostListings(
    page = 1,
    pageSize = 6
  ): Observable<Pagination<Listing>> {
    let params = new HttpParams()
      .set('page', String(page - 1))  // back en base 0
      .set('size', String(pageSize));

    return this.http
      .get<SpringPage<any>>(`${this.API_ACCOMMODATIONS}/host`, { params })
      .pipe(
        map((p) => ({
          items: (p.content ?? []).map(mapAccommodationFromApi),
          page: (p.number ?? 0) + 1,
          pageSize: p.size ?? pageSize,
          total: p.totalElements ?? (p.content?.length ?? 0),
          totalPages: p.totalPages ?? 1
        }))
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
