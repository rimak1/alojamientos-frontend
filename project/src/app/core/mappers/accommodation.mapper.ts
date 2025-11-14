import type { Listing, CreateListingRequest, UpdateListingRequest, ImagenListing } from '../models/listing.model';


const SERVICE_LABEL_TO_CODE: Record<string, string> = {
  'WiFi': 'WIFI',
  'Aire acondicionado': 'AIR_CONDITIONING',
  'Cocina equipada': 'KITCHEN',
  'TV': 'TV',
  'Lavadora': 'WASHER',
  'Parking gratuito': 'PARKING',
  'Jardín': 'GARDEN',
  'Piscina': 'POOL',
  'Gimnasio': 'GYM',
  'Spa': 'SPA',
  'Barbacoa': 'BBQ',
  'Terraza': 'TERRACE'
};

const SERVICE_CODE_TO_LABEL: Record<string, string> = {
  WIFI: 'WiFi',
  AIR_CONDITIONING: 'Aire acondicionado',
  KITCHEN: 'Cocina equipada',
  TV: 'TV',
  WASHER: 'Lavadora',
  PARKING: 'Parking gratuito',
  GARDEN: 'Jardín',
  POOL: 'Piscina',
  GYM: 'Gimnasio',
  SPA: 'Spa',
  BBQ: 'Barbacoa',
  TERRACE: 'Terraza'
};

export function mapAccommodationFromApi(api: any): Listing {
  // ---- Servicios ----
  const servicesRaw: any = api.services ?? api.typeServicesEnum ?? [];

  const serviceCodes: string[] = Array.isArray(servicesRaw)
    ? servicesRaw
    : servicesRaw != null
      ? [servicesRaw]
      : [];

  const servicesLabels = serviceCodes.map(code =>
    SERVICE_CODE_TO_LABEL[code] ?? String(code)
  );

  // ---- Imágenes ----
  const rawImages = api.images ?? api.imagesAccommodation ?? [];

  const imagenes: ImagenListing[] = Array.isArray(rawImages)
    ? rawImages.map((img: any, index: number): ImagenListing => ({
        url: img.url,
        principal: Boolean(
          img.principal ??
          img.isPrincipal ??
          (index === 0) // si nada viene marcado, la primera
        )
      }))
    : [];

  return {
    id: String(api.id),

    // El "título" en tu back es "qualification"
    titulo: api.qualification ?? api.title ?? api.name ?? '',

    descripcion: api.description ?? '',
    ciudad: api.city ?? '',
    direccion: api.address ?? api.address_accommodation ?? '',

    // Tu back envía latitude/longitude como string → convertimos a número
    lat: Number(api.latitude ?? api.lat ?? 0),
    lng: Number(api.longitude ?? api.lng ?? 0),

    precioNoche: api.priceNight ?? api.price_night ?? 0,
    capacidadMax: api.maximumCapacity ?? api.maximux_capacity_accommodation ?? 1,

    servicios: servicesLabels,
    imagenes,

    estado: api.statusAccommodation === 'ACTIVE' ? 'ACTIVO' : 'ELIMINADO',
    anfitrionId: String(api.idHost ?? ''),

    ratingPromedio: api.averageRating ?? api.ratingPromedio ?? undefined,
    createdAt: api.dateCreation ?? api.createdAt ?? '',
    updatedAt: api.dateUpdate ?? api.updatedAt ?? ''
  };
}

export function mapAccommodationToApi(
  source: CreateListingRequest | UpdateListingRequest,
  hostId: number
): any {
  const serviceCodes = (source.servicios || []).map(label =>
    SERVICE_LABEL_TO_CODE[label] ?? 'WIFI'
  );

  return {
    qualification: source.titulo,
    description: source.descripcion,
    city: source.ciudad,
    address: source.direccion,
    latitude: source.lat,
    longitude: source.lng,
    priceNight: source.precioNoche,
    maximumCapacity: source.capacidadMax,

    // lo que ahora pide el backend
    services: serviceCodes,
    idHost: hostId,

    // aunque el DTO marca images como READ_ONLY, no pasa nada por enviarlas
    images: (source.imagenes ?? []).map((img, index) => ({
      url: img.url,
      isPrincipal: img.principal,
      displayOrder: index + 1
    }))
  };
}
