import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { createResourceKeys } from '@/lib/queryKeys';
import { toast } from '@/store/toastStore';
import type { ListQueryParams } from '@/types/api';
import type { Option } from '@/types/common';

import { TRACKING_POLL_MS } from '../constants';
import type {
  AssignmentInput,
  GpsDeviceInput,
  RouteInput,
  StopInput,
  VehicleInput,
} from '../schemas';
import { transportService, type AssignmentQuery } from '../services/transportService';
import type { RouteDetail } from '../types';

export const vehicleKeys = createResourceKeys('transport-vehicles');
export const routeKeys = createResourceKeys('transport-routes');

export const transportKeys = {
  all: ['transport'] as const,
  summary: () => ['transport', 'summary'] as const,
  drivers: () => ['transport', 'drivers'] as const,
  assignments: (query: AssignmentQuery) => ['transport', 'assignments', query] as const,
  gpsDevices: () => ['transport', 'gps', 'devices'] as const,
  positions: () => ['transport', 'tracking'] as const,
};

/** The fleet changes far less often than its positions do. */
const LOOKUP_STALE_TIME = 5 * 60_000;

/**
 * Almost every write here moves something on another screen: putting a bus on
 * a route changes the route's capacity, the driver's roster and the fleet
 * summary at once. Precision would buy nothing and lose a stale-cell bug.
 */
function useInvalidateTransport() {
  const queryClient = useQueryClient();

  return async () => {
    await queryClient.invalidateQueries({ queryKey: transportKeys.all });
    await queryClient.invalidateQueries({ queryKey: vehicleKeys.all });
    await queryClient.invalidateQueries({ queryKey: routeKeys.all });
  };
}

// --- vehicles ---------------------------------------------------------------

export function useVehicles(params: ListQueryParams) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: ({ signal }) => transportService.list(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useVehicle(id: number | string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ''),
    queryFn: ({ signal }) => transportService.show(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

/** Active buses as select options, for the route form and the device form. */
export function useVehicleOptions() {
  const query = useQuery({
    queryKey: vehicleKeys.options(),
    queryFn: ({ signal }) => transportService.vehicles(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const vehicles = useMemo(() => query.data ?? [], [query.data]);

  const vehicleOptions = useMemo<Option<number>[]>(
    () =>
      vehicles.map((vehicle) => ({
        label: `${vehicle.name} — ${vehicle.registration_no} (${vehicle.capacity} seats)`,
        value: vehicle.id,
      })),
    [vehicles],
  );

  return { ...query, vehicles, vehicleOptions };
}

export function useCreateVehicle() {
  const invalidate = useInvalidateTransport();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleInput) => transportService.create(input),
    onSuccess: async (vehicle) => {
      queryClient.setQueryData(vehicleKeys.detail(vehicle.id), vehicle);
      await invalidate();
      toast.success('Bus added', `${vehicle.name} is on the fleet register.`);
    },
  });
}

export function useUpdateVehicle(id: number) {
  const invalidate = useInvalidateTransport();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleInput) => transportService.update(id, input),
    onSuccess: async (vehicle) => {
      queryClient.setQueryData(vehicleKeys.detail(vehicle.id), vehicle);
      await invalidate();
      toast.success('Bus updated');
    },
  });
}

export function useDeleteVehicle() {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (id: number) => transportService.remove(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Bus removed');
    },
  });
}

// --- drivers ----------------------------------------------------------------

export function useDrivers() {
  const query = useQuery({
    queryKey: transportKeys.drivers(),
    queryFn: ({ signal }) => transportService.drivers(signal),
    staleTime: 60_000,
  });

  const drivers = useMemo(() => query.data?.data ?? [], [query.data]);

  /** Only those who may actually drive are offered for a bus. */
  const driverOptions = useMemo<Option<number>[]>(
    () =>
      drivers.map((driver) => ({
        label: driver.can_drive
          ? `${driver.full_name} — ${driver.employee_id}`
          : `${driver.full_name} — ${driver.blocked_reason}`,
        value: driver.id,
        disabled: !driver.can_drive,
      })),
    [drivers],
  );

  return { ...query, drivers, driverOptions };
}

// --- routes -----------------------------------------------------------------

export function useRoutes(params: ListQueryParams) {
  return useQuery({
    queryKey: routeKeys.list(params),
    queryFn: ({ signal }) => transportService.routes(params, signal),
    placeholderData: (previous) => previous,
  });
}

export function useRouteOptions() {
  const query = useQuery({
    queryKey: routeKeys.options(),
    queryFn: ({ signal }) => transportService.routeOptions(signal),
    staleTime: LOOKUP_STALE_TIME,
  });

  const routes = useMemo(() => query.data ?? [], [query.data]);

  const routeOptions = useMemo<Option<number>[]>(
    () => routes.map((route) => ({ label: `${route.code} — ${route.name}`, value: route.id })),
    [routes],
  );

  return { ...query, routes, routeOptions };
}

export function useRoute(id: number | string | undefined) {
  return useQuery({
    queryKey: routeKeys.detail(id ?? ''),
    queryFn: ({ signal }) => transportService.showRoute(id!, signal),
    enabled: id !== undefined && id !== '',
  });
}

export function useCreateRoute() {
  const invalidate = useInvalidateTransport();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RouteInput) => transportService.createRoute(input),
    onSuccess: async (route) => {
      queryClient.setQueryData(routeKeys.detail(route.id), route);
      await invalidate();
      toast.success('Route created', 'Add its stops to put it into service.');
    },
  });
}

export function useUpdateRoute(id: number) {
  const invalidate = useInvalidateTransport();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RouteInput) => transportService.updateRoute(id, input),
    onSuccess: async (route) => {
      queryClient.setQueryData(routeKeys.detail(route.id), route);
      await invalidate();
      toast.success('Route updated');
    },
  });
}

export function useDeleteRoute() {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (id: number) => transportService.removeRoute(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Route removed');
    },
  });
}

// --- stops ------------------------------------------------------------------

/**
 * Every stop write returns the recomputed route, which is written straight
 * into the cache — the run's times and fares are derived from the stops, so
 * a client patching one row would show a route whose first pickup no longer
 * matched its first stop.
 */
function useStopMutation<TInput>(
  routeId: number,
  mutationFn: (input: TInput) => Promise<RouteDetail>,
  message: string,
) {
  const invalidate = useInvalidateTransport();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (route) => {
      queryClient.setQueryData(routeKeys.detail(routeId), route);
      await invalidate();
      toast.success(message);
    },
  });
}

export function useAddStop(routeId: number) {
  return useStopMutation<StopInput>(
    routeId,
    (input) => transportService.addStop(routeId, input),
    'Stop added',
  );
}

export function useUpdateStop(routeId: number, stopId: number) {
  return useStopMutation<StopInput>(
    routeId,
    (input) => transportService.updateStop(routeId, stopId, input),
    'Stop updated',
  );
}

export function useRemoveStop(routeId: number) {
  return useStopMutation<number>(
    routeId,
    (stopId) => transportService.removeStop(routeId, stopId),
    'Stop removed',
  );
}

export function useReorderStop(routeId: number) {
  return useStopMutation<{ stopId: number; sequence: number }>(
    routeId,
    ({ stopId, sequence }) => transportService.reorderStop(routeId, stopId, sequence),
    'Route reordered',
  );
}

// --- assignments ------------------------------------------------------------

export function useAssignments(query: AssignmentQuery) {
  return useQuery({
    queryKey: transportKeys.assignments(query),
    queryFn: ({ signal }) => transportService.assignments(query, signal),
    placeholderData: (previous) => previous,
  });
}

export function useAssignStudent() {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (input: AssignmentInput) => transportService.assign(input),
    onSuccess: async (assignment) => {
      await invalidate();
      toast.success(
        'Student assigned',
        `${assignment.student_name} boards at ${assignment.stop_name}.`,
      );
    },
  });
}

export function useUnassignStudent() {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (id: number) => transportService.unassign(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Student taken off transport');
    },
  });
}

// --- GPS --------------------------------------------------------------------

export function useGpsDevices() {
  return useQuery({
    queryKey: transportKeys.gpsDevices(),
    queryFn: ({ signal }) => transportService.gpsDevices(signal),
    refetchInterval: 60_000,
  });
}

export function useSaveGpsDevice(id?: number) {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (input: GpsDeviceInput) => transportService.saveGpsDevice(input, id),
    onSuccess: async () => {
      await invalidate();
      toast.success(id ? 'Tracker updated' : 'Tracker registered');
    },
  });
}

export function useRemoveGpsDevice() {
  const invalidate = useInvalidateTransport();

  return useMutation({
    mutationFn: (id: number) => transportService.removeGpsDevice(id),
    onSuccess: async () => {
      await invalidate();
      toast.success('Tracker removed');
    },
  });
}

/**
 * Live positions.
 *
 * Polls while the tab is in front of somebody and stops when it is not —
 * a fleet view left open overnight should not spend the night asking.
 */
export function useVehiclePositions(enabled = true) {
  return useQuery({
    queryKey: transportKeys.positions(),
    queryFn: ({ signal }) => transportService.positions(signal),
    enabled,
    refetchInterval: enabled ? TRACKING_POLL_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useTransportSummary() {
  return useQuery({
    queryKey: transportKeys.summary(),
    queryFn: ({ signal }) => transportService.summary(signal),
    staleTime: 60_000,
  });
}

// --- printing and export ----------------------------------------------------

export function useDownloadRouteSheet() {
  return useMutation({
    mutationFn: ({ routeId, routeCode }: { routeId: number; routeCode: string }) =>
      transportService.downloadRouteSheet(routeId, routeCode),
    onError: (error: Error) => toast.error('Could not download the route sheet', error.message),
  });
}

export function useExportVehicles() {
  return useMutation({
    mutationFn: ({ params, format }: { params: ListQueryParams; format: 'pdf' | 'excel' }) =>
      transportService.exportVehicles(params, format),
    onError: (error: Error) => toast.error('Could not export the fleet', error.message),
  });
}
