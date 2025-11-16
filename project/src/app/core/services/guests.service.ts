import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface GuestContact {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
}

@Injectable({ providedIn: 'root' })
export class GuestsService {
    private readonly API = `${environment.apiBaseUrl}/guests`;

    constructor(private http: HttpClient) { }

    getById(id: string): Observable<GuestContact> {
        return this.http.get<any>(`${this.API}/${id}`).pipe(
            map(api => ({
                id: String(api.id),
                nombre: api.name,
                email: api.email,
                telefono: api.phone
            }))
        );
    }
}
