import type { Booking, CreateBookingRequest } from '../models/booking.model';

export function mapBookingFromApi(api: any): Booking {
  return {
    id: String(api.id),
    alojamientoId: String(api.idAccommodation),
    usuarioId: String(api.idGuest),
    checkIn: api.dateCheckin?.split('T')[0],
    checkOut: api.dateCheckout?.split('T')[0],
    huespedes: api.quantityPeople,
    estado: api.statusReservation,
    creadoEn: api.dateCreation,
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
