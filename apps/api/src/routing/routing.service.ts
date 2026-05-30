import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { IsochroneResult, RouteResult } from '../common/domain';
import { decodePolyline } from './polyline';

export interface RoutePoint {
  lat: number;
  lng: number;
}

/** Rough urban speeds (m/s) used only for the no-Valhalla fallback estimate. */
const FALLBACK_SPEED_MPS: Record<string, number> = {
  auto: 11.2, // ~25 mph
  truck: 9.8,
  bicycle: 4.5,
  pedestrian: 1.4,
};

@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name);
  private readonly valhallaUrl = process.env.VALHALLA_URL;
  private readonly timeoutMs = Number(process.env.VALHALLA_TIMEOUT_MS) || 4000;

  /**
   * Route between two points. Uses Valhalla when VALHALLA_URL is configured and
   * reachable; otherwise returns a clearly-labeled straight-line estimate so
   * the operating picture still renders something usable.
   */
  async route(
    from: RoutePoint,
    to: RoutePoint,
    costing = 'auto',
    alternates = 0,
  ): Promise<RouteResult> {
    if (this.valhallaUrl) {
      try {
        return await this.valhallaRoute(from, to, costing, alternates);
      } catch (err) {
        this.logger.warn(
          `Valhalla route failed (${(err as Error).message}); using straight-line fallback`,
        );
      }
    }
    return this.straightLineRoute(from, to, costing);
  }

  /** Travel-time isochrones. Requires Valhalla — no meaningful fallback. */
  async isochrone(
    center: RoutePoint,
    contourMinutes: number[],
    costing = 'auto',
  ): Promise<IsochroneResult> {
    if (!this.valhallaUrl) {
      throw new ServiceUnavailableException(
        'Isochrones require the Valhalla routing engine (set VALHALLA_URL)',
      );
    }
    const body = {
      locations: [{ lat: center.lat, lon: center.lng }],
      costing,
      contours: contourMinutes.map((time) => ({ time })),
      polygons: true,
    };
    const geojson = await this.post('/isochrone', body);
    return { engine: 'valhalla', costing, contourMinutes, geojson };
  }

  private async valhallaRoute(
    from: RoutePoint,
    to: RoutePoint,
    costing: string,
    alternates: number,
  ): Promise<RouteResult> {
    const body: Record<string, unknown> = {
      locations: [
        { lat: from.lat, lon: from.lng },
        { lat: to.lat, lon: to.lng },
      ],
      costing,
      directions_options: { units: 'kilometers' },
    };
    if (alternates > 0) {
      body.alternates = alternates;
    }
    const data = (await this.post('/route', body)) as ValhallaRouteResponse;
    const result = this.mapTrip(data.trip, costing);
    if (data.alternates?.length) {
      result.alternatives = data.alternates.map((a) =>
        this.mapTrip(a.trip, costing),
      );
    }
    return result;
  }

  private mapTrip(trip: ValhallaTrip, costing: string): RouteResult {
    const geometry: [number, number][] = [];
    for (const leg of trip.legs) {
      geometry.push(...decodePolyline(leg.shape, 6));
    }
    return {
      engine: 'valhalla',
      costing,
      distanceMeters: Math.round(trip.summary.length * 1000),
      durationSeconds: Math.round(trip.summary.time),
      geometry,
    };
  }

  private straightLineRoute(
    from: RoutePoint,
    to: RoutePoint,
    costing: string,
  ): RouteResult {
    const distanceMeters = haversineMeters(from, to);
    const speed = FALLBACK_SPEED_MPS[costing] ?? FALLBACK_SPEED_MPS.auto;
    return {
      engine: 'straight-line',
      costing,
      distanceMeters: Math.round(distanceMeters),
      durationSeconds: Math.round(distanceMeters / speed),
      geometry: [
        [from.lat, from.lng],
        [to.lat, to.lng],
      ],
    };
  }

  private async post(path: string, body: unknown): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${this.valhallaUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(`Valhalla responded ${res.status}`);
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }
}

interface ValhallaTrip {
  summary: { length: number; time: number };
  legs: { shape: string }[];
}

interface ValhallaRouteResponse {
  trip: ValhallaTrip;
  alternates?: { trip: ValhallaTrip }[];
}

function haversineMeters(a: RoutePoint, b: RoutePoint): number {
  const R = 6371008.8;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
