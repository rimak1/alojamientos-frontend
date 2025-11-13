import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import type { Review, CreateReviewRequest, ReplyToReviewRequest } from '../models/review.model';
import { map, Observable } from 'rxjs';
import { mapCreateReviewToApi, mapReplyReviewToApi, mapReviewFromApi } from '../mappers/review.mapper';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  constructor(private http: HttpClient) { }

  createReview(body: CreateReviewRequest): Observable<Review> {
    return this.http.post<any>(`${environment.apiBaseUrl}/comments`, mapCreateReviewToApi(body)).pipe(map(mapReviewFromApi));
  }

  replyToReview(commentId: string, body: ReplyToReviewRequest): Observable<Review> {
    return this.http.post<any>(`${environment.apiBaseUrl}/comments/${commentId}/answer`, mapReplyReviewToApi(body)).pipe(map(mapReviewFromApi));
  }

  getListingReviews(accommodationId: string): Observable<Review[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/accommodation/${accommodationId}/comments`).pipe(map(list => list.map(mapReviewFromApi)));
  }

  deleteMyReview(commentId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiBaseUrl}/comments/${commentId}`);
  }
}
