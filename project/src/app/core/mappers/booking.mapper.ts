import type { Booking, CreateBookingRequest } from '../models/booking.model';

function mapEstadoApiToEs(status: string): Booking['estado'] {
  const map: Record<string, Booking['estado']> = {
    PENDING: 'PENDIENTE',
    CONFIRMED: 'CONFIRMADA',
    PAID: 'CONFIRMADA',
    CANCELED: 'CANCELADA',
    COMPLETED: 'COMPLETADA'
  };
  return map[status] ?? 'PENDIENTE';
}
export function mapBookingFromApi(api: any): Booking {
  return {
    id: String(api.id),
    alojamientoId: String(api.idAccommodation),
    usuarioId: String(api.idGuest),
    checkIn: api.dateCheckin,
    checkOut: api.dateCheckout,
    huespedes: api.quantityPeople,
    estado: mapEstadoApiToEs(api.statusReservation),
    creadoEn: api.dateCreation,
    alojamiento: api.accommodation ? {
      titulo: api.accommodation.title ?? api.accommodation.qualification ?? '',
      ciudad: api.accommodation.city ?? '',
      precioNoche: api.accommodation.priceNight ?? 0,
      imagenPrincipal: api.accommodation.mainImageUrl ?? ''
    } : undefined,
    usuario: api.guestName || api.guestEmail ? {
      nombre: api.guestName ?? 'Huésped',
      email: api.guestEmail ?? '',
    } : undefined
  };
}

export function mapBookingToApi(front: CreateBookingRequest, guestId: number) {
  return {
    dateCheckin: `${front.checkIn}T14:00:00`,
    dateCheckout: `${front.checkOut}T12:00:00`,
    idAccommodation: Number(front.alojamientoId),
    idGuest: guestId,
    quantityPeople: front.huespedes
  };
}
