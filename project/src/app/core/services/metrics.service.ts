import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface MetricData {
  totalReservas: number;
  ingresosTotales: number;
  ratingPromedio: number;
  ocupacionPromedio: number;
  reservasPorMes: { mes: string; reservas: number; ingresos: number }[];
}

/** Normaliza distintas respuestas posibles del backend a MetricData */
function normalizeMetrics(api: any): MetricData {
  // 1) Respuesta ya con las claves esperadas
  if (api && typeof api === 'object' && !Array.isArray(api) && api.totalReservas !== undefined) {
    return api as MetricData;
  }

  // 2) Respuesta en inglés
  if (api && typeof api === 'object' && !Array.isArray(api) && api.totalBookings !== undefined) {
    return {
      totalReservas: Number(api.totalBookings) ?? 0,
      ingresosTotales: Number(api.totalRevenue) ?? 0,
      ratingPromedio: Number(api.averageRating) ?? 0,
      ocupacionPromedio: Number(api.occupancy) ?? 0,
      reservasPorMes: (api.bookingsByMonth ?? []).map((m: any) => ({
        mes: m.monthLabel ?? m.month ?? '',
        reservas: Number(m.count ?? m.bookings ?? 0),
        ingresos: Number(m.revenue ?? 0),
      })),
    };
  }

  // 3) Respuesta tipo { data: [], averageRating?, occupancy? }
  if (api && typeof api === 'object' && Array.isArray(api.data)) {
    const arr = api.data as any[];
    const byMonth: Record<string, { reservas: number; ingresos: number }> = {};
    let total = 0;
    let revenue = 0;

    arr.forEach((r) => {
      const mes = r.monthLabel || r.month || (r.checkIn?.slice(0, 7) ?? 'N/A'); // yyyy-MM
      byMonth[mes] ??= { reservas: 0, ingresos: 0 };
      byMonth[mes].reservas += 1;
      byMonth[mes].ingresos += Number(r.total ?? r.amount ?? 0);
      total += 1;
      revenue += Number(r.total ?? r.amount ?? 0);
    });

    return {
      totalReservas: total,
      ingresosTotales: revenue,
      ratingPromedio: Number(api.averageRating ?? 0),
      ocupacionPromedio: Number(api.occupancy ?? 0),
      reservasPorMes: Object.entries(byMonth).map(([mes, v]) => ({ mes, reservas: v.reservas, ingresos: v.ingresos })),
    };
  }

  // 4) Respuesta como array plano (sin metadatos)
  if (Array.isArray(api)) {
    const byMonth: Record<string, { reservas: number; ingresos: number }> = {};
    let total = 0;
    let revenue = 0;

    (api as any[]).forEach((r) => {
      const mes = r?.monthLabel || r?.month || (r?.checkIn?.slice(0, 7) ?? 'N/A'); // yyyy-MM
      byMonth[mes] ??= { reservas: 0, ingresos: 0 };
      byMonth[mes].reservas += 1;
      byMonth[mes].ingresos += Number(r?.total ?? r?.amount ?? 0);
      total += 1;
      revenue += Number(r?.total ?? r?.amount ?? 0);
    });

    return {
      totalReservas: total,
      ingresosTotales: revenue,
      ratingPromedio: 0,      // sin metadatos, dejamos 0
      ocupacionPromedio: 0,   // sin metadatos, dejamos 0
      reservasPorMes: Object.entries(byMonth).map(([mes, v]) => ({ mes, reservas: v.reservas, ingresos: v.ingresos })),
    };
  }

  // Fallback
  return {
    totalReservas: 0,
    ingresosTotales: 0,
    ratingPromedio: 0,
    ocupacionPromedio: 0,
    reservasPorMes: [],
  };
}


@Injectable({ providedIn: 'root' })
export class MetricsService {

  private readonly API = `${environment.apiBaseUrl}/hosts/me/metrics`;

  constructor(private http: HttpClient) { }

  /** Obtiene métricas del host autenticado entre fechas (yyyy-MM-dd) */
  getHostMetrics(desde?: string, hasta?: string): Observable<MetricData> {
    let params = new HttpParams();
    if (desde) params = params.set('from', desde);
    if (hasta) params = params.set('to', hasta);

    return this.http.get<any>(this.API, { params }).pipe(map(normalizeMetrics));
  }
}
