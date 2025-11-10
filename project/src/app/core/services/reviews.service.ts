import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import type { Review, CreateReviewRequest, ReplyToReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private readonly API_URL = 'https://api.alojamientos.com';

  constructor(private http: HttpClient) {}

  /**
   * Obtener comentarios de un alojamiento
   */
  getListingReviews(alojamientoId: string): Observable<Review[]> {
    const mockReviews: Review[] = [
      {
        id: '1',
        reservaId: '1',
        alojamientoId,
        usuarioId: '2',
        rating: 5,
        texto: 'Excelente alojamiento, muy limpio y cómodo. La ubicación es perfecta.',
        fecha: '2025-01-15T14:30:00Z',
        usuario: {
          nombre: 'María García',
          fotoUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      },
      {
        id: '2',
        reservaId: '2',
        alojamientoId,
        usuarioId: '3',
        rating: 4,
        texto: 'Muy buena experiencia. El apartamento estaba tal como se describe.',
        fecha: '2025-01-10T16:15:00Z',
        respuestaAnfitrion: 'Muchas gracias por tu comentario. ¡Esperamos verte pronto de nuevo!',
        usuario: {
          nombre: 'Carlos López'
        }
      }
    ];

    return of(mockReviews).pipe(delay(600));
  }

  /**
   * Crear nuevo comentario
   */
  createReview(reviewData: CreateReviewRequest): Observable<Review> {
    const mockReview: Review = {
      id: Date.now().toString(),
      ...reviewData,
      usuarioId: '1',
      fecha: new Date().toISOString(),
      usuario: {
        nombre: 'Usuario Demo'
      }
    };

    return of(mockReview).pipe(delay(800));
  }

  /**
   * Responder a un comentario (solo anfitriones)
   */
  replyToReview(reviewId: string, reply: ReplyToReviewRequest): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  /**
   * Verificar si el usuario puede comentar una reserva
   */
  canReviewBooking(reservaId: string): Observable<boolean> {
    return of(true).pipe(delay(300));
  }
}