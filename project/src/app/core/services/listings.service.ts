import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay, map } from 'rxjs';
import type { Listing, CreateListingRequest, UpdateListingRequest } from '../models/listing.model';
import type { Pagination, SearchFilters } from '../models/common.model';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private readonly API_URL = 'https://api.alojamientos.com';

  constructor(private http: HttpClient) {}

  /**
   * Buscar alojamientos con filtros y paginación
   */
  searchListings(filters: SearchFilters, page: number = 1, pageSize: number = 10): Observable<Pagination<Listing>> {
    // Mock data
    const mockListings: Listing[] = [
      {
        id: '1',
        titulo: 'Apartamento moderno en el centro',
        descripcion: 'Hermoso apartamento totalmente equipado en el corazón de la ciudad.',
        ciudad: 'Madrid',
        direccion: 'Calle Gran Vía 15',
        lat: 40.4168,
        lng: -3.7038,
        precioNoche: 89,
        capacidadMax: 4,
        servicios: ['WiFi', 'Aire acondicionado', 'Cocina equipada'],
        imagenes: [
          { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', principal: true },
          { url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800', principal: false }
        ],
        estado: 'ACTIVO',
        anfitrionId: '1',
        ratingPromedio: 4.5
      },
      {
        id: '2',
        titulo: 'Casa rural con vistas al mar',
        descripcion: 'Tranquila casa rural perfecta para desconectar, con increíbles vistas al océano.',
        ciudad: 'Santander',
        direccion: 'Camino del Faro 23',
        lat: 43.4623,
        lng: -3.8099,
        precioNoche: 120,
        capacidadMax: 6,
        servicios: ['WiFi', 'Jardín', 'Parking gratuito', 'Barbacoa'],
        imagenes: [
          { url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800', principal: true }
        ],
        estado: 'ACTIVO',
        anfitrionId: '2',
        ratingPromedio: 4.8
      }
    ];

    // Apply filters
    let filteredListings = mockListings.filter(listing => 
      listing.estado === 'ACTIVO' &&
      (!filters.ciudad || listing.ciudad.toLowerCase().includes(filters.ciudad.toLowerCase())) &&
      (!filters.precioMin || listing.precioNoche >= filters.precioMin) &&
      (!filters.precioMax || listing.precioNoche <= filters.precioMax) &&
      (!filters.servicios?.length || filters.servicios.some(servicio => listing.servicios.includes(servicio)))
    );

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const items = filteredListings.slice(startIndex, startIndex + pageSize);

    return of({
      items,
      page,
      pageSize,
      total: filteredListings.length,
      totalPages: Math.ceil(filteredListings.length / pageSize)
    }).pipe(delay(500));

    // Real implementation would be:
    // let params = new HttpParams()
    //   .set('page', page.toString())
    //   .set('size', pageSize.toString());
    
    // if (filters.ciudad) params = params.set('ciudad', filters.ciudad);
    // if (filters.fechaInicio) params = params.set('fechaInicio', filters.fechaInicio);
    // if (filters.fechaFin) params = params.set('fechaFin', filters.fechaFin);
    // if (filters.precioMin) params = params.set('precioMin', filters.precioMin.toString());
    // if (filters.precioMax) params = params.set('precioMax', filters.precioMax.toString());
    // if (filters.servicios?.length) params = params.set('servicios', filters.servicios.join(','));

    // return this.http.get<Pagination<Listing>>(`${this.API_URL}/alojamientos`, { params });
  }

  /**
   * Obtener detalle de un alojamiento
   */
  getListingById(id: string): Observable<Listing> {
    const mockListing: Listing = {
      id,
      titulo: 'Apartamento moderno en el centro',
      descripcion: 'Hermoso apartamento totalmente equipado en el corazón de la ciudad. Perfecto para una estancia cómoda con todas las comodidades necesarias.',
      ciudad: 'Madrid',
      direccion: 'Calle Gran Vía 15',
      lat: 40.4168,
      lng: -3.7038,
      precioNoche: 89,
      capacidadMax: 4,
      servicios: ['WiFi', 'Aire acondicionado', 'Cocina equipada', 'TV', 'Lavadora'],
      imagenes: [
        { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', principal: true },
        { url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800', principal: false },
        { url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=800', principal: false }
      ],
      estado: 'ACTIVO',
      anfitrionId: '1',
      ratingPromedio: 4.5
    };

    return of(mockListing).pipe(delay(600));
  }

  /**
   * Obtener alojamientos del anfitrión actual
   */
  getHostListings(): Observable<Listing[]> {
    const mockListings: Listing[] = [
      {
        id: '1',
        titulo: 'Apartamento moderno en el centro',
        descripcion: 'Hermoso apartamento totalmente equipado.',
        ciudad: 'Madrid',
        direccion: 'Calle Gran Vía 15',
        lat: 40.4168,
        lng: -3.7038,
        precioNoche: 89,
        capacidadMax: 4,
        servicios: ['WiFi', 'Aire acondicionado'],
        imagenes: [
          { url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', principal: true }
        ],
        estado: 'ACTIVO',
        anfitrionId: '1',
        ratingPromedio: 4.5
      }
    ];

    return of(mockListings).pipe(delay(500));
  }

  /**
   * Crear nuevo alojamiento
   */
  createListing(listingData: CreateListingRequest): Observable<Listing> {
    return of({
      id: Date.now().toString(),
      ...listingData,
      estado: 'ACTIVO' as const,
      anfitrionId: '1'
    }).pipe(delay(1000));
  }

  /**
   * Actualizar alojamiento existente
   */
  updateListing(listingData: UpdateListingRequest): Observable<Listing> {
    return of({
      ...listingData,
      estado: 'ACTIVO' as const,
      anfitrionId: '1'
    }).pipe(delay(1000));
  }

  /**
   * Eliminar alojamiento (soft delete)
   */
  deleteListing(id: string): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  /**
   * Obtener ciudades para autocompletado
   */
  getCities(query: string): Observable<string[]> {
    const cities = ['Madrid', 'Barcelona', 'Sevilla', 'Valencia', 'Bilbao', 'Málaga', 'Granada', 'Santander'];
    return of(cities.filter(city => 
      city.toLowerCase().includes(query.toLowerCase())
    )).pipe(delay(300));
  }

  /**
   * Obtener servicios disponibles
   */
  getServices(): Observable<string[]> {
    return of([
      'WiFi', 'Aire acondicionado', 'Cocina equipada', 'TV', 
      'Lavadora', 'Parking gratuito', 'Jardín', 'Piscina',
      'Gimnasio', 'Spa', 'Barbacoa', 'Terraza'
    ]);
  }
}