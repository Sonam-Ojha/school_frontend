import { http } from '@/lib/axios';
import { createCrudService } from '@/lib/createCrudService';
import { downloadFile, timestampedFilename } from '@/lib/download';
import type {
  ApiResource,
  CollectionResponse,
  ListQueryParams,
  PaginatedResponse,
} from '@/types/api';

import type { AssignmentInput, GpsDeviceInput, RouteInput, StopInput, VehicleInput } from '../schemas';
import type {
  GpsDevice,
  RouteDetail,
  TransportAssignment,
  TransportRoute,
  TransportSummary,
  Vehicle,
  VehiclePosition,
} from '../types';

const vehicleCrud = createCrudService<Vehicle>('/transport/vehicles');

const nullable = (value: string): string | null => value.trim() || null;

/** Blank optional numbers are "not recorded", not zero. */
const optionalNumber = (value: string): number | null =>
  value.trim() === '' ? null : Number(value);

const toVehiclePayload = (input: VehicleInput) => ({
  // Stored without separators so a search matches however it was typed.
  registration_no: input.registration_no.replace(/[\s-]/g, '').toUpperCase(),
  name: input.name.trim(),
  make: nullable(input.make),
  model: nullable(input.model),
  manufacture_year: optionalNumber(input.manufacture_year),
  capacity: input.capacity,
  fuel_type: input.fuel_type,
  status: input.status,
  driver_id: input.driver_id,
  attendant_id: input.attendant_id,
  insurance_expiry: nullable(input.insurance_expiry),
  fitness_expiry: nullable(input.fitness_expiry),
  permit_expiry: nullable(input.permit_expiry),
  pollution_expiry: nullable(input.pollution_expiry),
  odometer_km: optionalNumber(input.odometer_km),
  notes: nullable(input.notes),
});

const toRoutePayload = (input: RouteInput) => ({
  name: input.name.trim(),
  code: input.code.trim().toUpperCase(),
  description: nullable(input.description),
  vehicle_id: input.vehicle_id,
  distance_km: optionalNumber(input.distance_km),
  is_active: input.is_active,
});

const toStopPayload = (input: StopInput) => ({
  name: input.name.trim(),
  sequence: input.sequence,
  landmark: nullable(input.landmark),
  pickup_time: input.pickup_time,
  drop_time: input.drop_time,
  fare: input.fare,
  latitude: optionalNumber(input.latitude),
  longitude: optionalNumber(input.longitude),
});

export interface AssignmentQuery extends ListQueryParams {
  route_id?: number;
  stop_id?: number;
}

export const transportService = {
  // --- vehicles ---

  list: vehicleCrud.list,
  remove: vehicleCrud.remove,

  async vehicles(signal?: AbortSignal): Promise<Vehicle[]> {
    const { data } = await http.get<CollectionResponse<Vehicle>>('/transport/vehicles', {
      params: { per_page: 'all', status: 'active' },
      signal,
    });
    return data.data;
  },

  async show(id: number | string, signal?: AbortSignal): Promise<Vehicle> {
    const { data } = await http.get<ApiResource<Vehicle>>(`/transport/vehicles/${id}`, { signal });
    return data.data;
  },

  async create(input: VehicleInput): Promise<Vehicle> {
    const { data } = await http.post<ApiResource<Vehicle>>(
      '/transport/vehicles',
      toVehiclePayload(input),
    );
    return data.data;
  },

  async update(id: number, input: VehicleInput): Promise<Vehicle> {
    const { data } = await http.put<ApiResource<Vehicle>>(
      `/transport/vehicles/${id}`,
      toVehiclePayload(input),
    );
    return data.data;
  },

  // --- drivers: read from the staff roster, never a second table ---

  /**
   * Staff who may drive, with what they are currently on.
   *
   * Served by transport rather than by staff because the joining — which bus,
   * which route, is the licence still valid for the run — is transport's
   * question, and the staff module has no business knowing about routes.
   */
  async drivers(signal?: AbortSignal): Promise<PaginatedResponse<DriverSummary>> {
    const { data } = await http.get<PaginatedResponse<DriverSummary>>('/transport/drivers', {
      params: { per_page: 'all' },
      signal,
    });
    return data;
  },

  // --- routes ---

  async routes(params: ListQueryParams = {}, signal?: AbortSignal) {
    const { data } = await http.get<PaginatedResponse<TransportRoute>>('/transport/routes', {
      params,
      signal,
    });
    return data;
  },

  async routeOptions(signal?: AbortSignal): Promise<TransportRoute[]> {
    const { data } = await http.get<CollectionResponse<TransportRoute>>('/transport/routes', {
      params: { per_page: 'all', is_active: 1 },
      signal,
    });
    return data.data;
  },

  async showRoute(id: number | string, signal?: AbortSignal): Promise<RouteDetail> {
    const { data } = await http.get<ApiResource<RouteDetail>>(`/transport/routes/${id}`, {
      signal,
    });
    return data.data;
  },

  async createRoute(input: RouteInput): Promise<RouteDetail> {
    const { data } = await http.post<ApiResource<RouteDetail>>(
      '/transport/routes',
      toRoutePayload(input),
    );
    return data.data;
  },

  async updateRoute(id: number, input: RouteInput): Promise<RouteDetail> {
    const { data } = await http.put<ApiResource<RouteDetail>>(
      `/transport/routes/${id}`,
      toRoutePayload(input),
    );
    return data.data;
  },

  async removeRoute(id: number): Promise<void> {
    await http.delete(`/transport/routes/${id}`);
  },

  // --- stops, always nested under their route ---

  /**
   * Stop writes return the recomputed route.
   *
   * The run's start and end times, its stop count and the fares on it are all
   * derived from the stops, so the side that owns the arithmetic sends them
   * back rather than leaving the client to patch one row and guess the rest.
   */
  async addStop(routeId: number, input: StopInput): Promise<RouteDetail> {
    const { data } = await http.post<ApiResource<RouteDetail>>(
      `/transport/routes/${routeId}/stops`,
      toStopPayload(input),
    );
    return data.data;
  },

  async updateStop(routeId: number, stopId: number, input: StopInput): Promise<RouteDetail> {
    const { data } = await http.put<ApiResource<RouteDetail>>(
      `/transport/routes/${routeId}/stops/${stopId}`,
      toStopPayload(input),
    );
    return data.data;
  },

  async removeStop(routeId: number, stopId: number): Promise<RouteDetail> {
    const { data } = await http.delete<ApiResource<RouteDetail>>(
      `/transport/routes/${routeId}/stops/${stopId}`,
    );
    return data.data;
  },

  /** Move a stop up or down the run; the API renumbers the rest. */
  async reorderStop(routeId: number, stopId: number, sequence: number): Promise<RouteDetail> {
    const { data } = await http.put<ApiResource<RouteDetail>>(
      `/transport/routes/${routeId}/stops/${stopId}/sequence`,
      { sequence },
    );
    return data.data;
  },

  // --- student assignments ---

  async assignments(
    query: AssignmentQuery = {},
    signal?: AbortSignal,
  ): Promise<PaginatedResponse<TransportAssignment>> {
    const { data } = await http.get<PaginatedResponse<TransportAssignment>>(
      '/transport/assignments',
      { params: query, signal },
    );
    return data;
  },

  async assign(input: AssignmentInput): Promise<TransportAssignment> {
    const { data } = await http.post<ApiResource<TransportAssignment>>('/transport/assignments', {
      student_id: input.student_id,
      route_id: input.route_id,
      stop_id: input.stop_id,
      trip: input.trip,
      start_date: input.start_date,
    });
    return data.data;
  },

  async unassign(id: number): Promise<void> {
    await http.delete(`/transport/assignments/${id}`);
  },

  // --- GPS ---

  async gpsDevices(signal?: AbortSignal): Promise<GpsDevice[]> {
    const { data } = await http.get<CollectionResponse<GpsDevice>>('/transport/gps/devices', {
      params: { per_page: 'all' },
      signal,
    });
    return data.data;
  },

  async saveGpsDevice(input: GpsDeviceInput, id?: number): Promise<GpsDevice> {
    const payload = {
      imei: input.imei.trim(),
      sim_number: nullable(input.sim_number),
      provider: input.provider.trim(),
      vehicle_id: input.vehicle_id,
      installed_on: input.installed_on,
    };

    const { data } = id
      ? await http.put<ApiResource<GpsDevice>>(`/transport/gps/devices/${id}`, payload)
      : await http.post<ApiResource<GpsDevice>>('/transport/gps/devices', payload);

    return data.data;
  },

  async removeGpsDevice(id: number): Promise<void> {
    await http.delete(`/transport/gps/devices/${id}`);
  },

  /**
   * Where every bus is now.
   *
   * Polled rather than pushed: a school office watching the morning run wants
   * a refresh every few seconds, and a socket for that is infrastructure this
   * does not need. When a vendor pushes over a socket, the backend still
   * writes positions and this endpoint still answers — nothing here changes.
   */
  async positions(signal?: AbortSignal): Promise<VehiclePosition[]> {
    const { data } = await http.get<CollectionResponse<VehiclePosition>>('/transport/tracking', {
      signal,
    });
    return data.data;
  },

  async summary(signal?: AbortSignal): Promise<TransportSummary> {
    const { data } = await http.get<ApiResource<TransportSummary>>('/transport/summary', {
      signal,
    });
    return data.data;
  },

  // --- printing and export ---

  /** The route sheet the driver carries: stops, times and the pickup list. */
  async downloadRouteSheet(routeId: number, routeCode: string): Promise<void> {
    await downloadFile(
      `/transport/routes/${routeId}/sheet`,
      timestampedFilename(`route-${routeCode.toLowerCase()}`, 'pdf'),
    );
  },

  async exportVehicles(params: ListQueryParams, format: 'pdf' | 'excel'): Promise<void> {
    await downloadFile(
      '/transport/vehicles/export',
      timestampedFilename('transport-fleet', format === 'excel' ? 'xlsx' : 'pdf'),
      { params: { ...params, format } },
    );
  },
};

/** A driver as transport sees them — the staff record plus what they are on. */
export interface DriverSummary {
  id: number;
  full_name: string;
  employee_id: string;
  phone: string;
  photo_url: string | null;
  status: string;
  licence_number: string | null;
  licence_expiry: string | null;
  /** Negative once lapsed; null when no licence is recorded. */
  licence_days_remaining: number | null;
  vehicle_id: number | null;
  vehicle_registration: string | null;
  route_id: number | null;
  route_name: string | null;
  /** False when the licence has lapsed or they are not in service. */
  can_drive: boolean;
  blocked_reason: string | null;
}

export type { ListQueryParams };
