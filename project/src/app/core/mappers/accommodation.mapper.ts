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
  const servicesRaw: string[] =
    api.services ??
    api.typeServices ??
    [];

  const servicesLabels = servicesRaw.map(code =>
    SERVICE_CODE_TO_LABEL[code] ?? code
  );

  const rawImages = api.images ?? api.imagesAccommodation ?? [];

  return {
    id: String(api.id),
    titulo: api.title ?? api.name ?? '',
    descripcion: api.description ?? '',
    ciudad: api.city ?? '',
    direccion: api.address ?? '',
    lat: api.latitude ?? api.lat ?? 0,
    lng: api.longitude ?? api.lng ?? 0,
    precioNoche: api.priceNight ?? api.price_night ?? 0,
    capacidadMax: api.maximumCapacity ?? api.maximux_capacity_accommodation ?? 1,
    servicios: Array.isArray(api.services)
      ? api.services.map((s: any) => String(s))
      : api.typeServicesEnum
        ? [String(api.typeServicesEnum)]
        : [],
    imagenes: (api.images || []).map((img: any): ImagenListing => ({
      url: img.url,
      principal: img.isPrincipal ?? img.principal ?? false
    })),
    estado: api.statusAccommodation === 'ACTIVE' ? 'ACTIVO' : 'ELIMINADO',
    anfitrionId: String(api.idHost ?? ''),
    ratingPromedio: api.averageRating ?? undefined,
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

  // RequestAccommodationDto SOLO admite un TypeServicesEnum,
  // así que mandamos el primero de la lista:
  const mainService = serviceCodes[0] ?? 'WIFI';

  return {
    qualification: source.titulo,
    description: source.descripcion,
    city: source.ciudad,
    latitude: source.lat,
    longitude: source.lng,
    priceNight: source.precioNoche,
    maximumCapacity: source.capacidadMax,

    typeServicesEnum: 'WIFI',

    images: (source.imagenes ?? []).map((img, index) => ({
      url: img.url,
      isPrincipal: img.principal,
      displayOrder: index + 1
    }))
  };
}
