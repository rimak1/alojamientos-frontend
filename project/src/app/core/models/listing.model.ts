export interface Listing {
  id: string;
  titulo: string;
  descripcion: string;
  ciudad: string;
  direccion: string;
  lat: number;
  lng: number;
  precioNoche: number;
  capacidadMax: number;
  servicios: string[];
  imagenes: ImagenListing[];
  estado: 'ACTIVO' | 'ELIMINADO';
  anfitrionId: string;
  ratingPromedio?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImagenListing {
  url: string;
  principal: boolean;
}

export interface CreateListingRequest {
  titulo: string;
  descripcion: string;
  ciudad: string;
  direccion: string;
  lat: number;
  lng: number;
  precioNoche: number;
  capacidadMax: number;
  servicios: string[];
  imagenes: ImagenListing[];
}

export interface UpdateListingRequest extends CreateListingRequest {
  id: string;
}