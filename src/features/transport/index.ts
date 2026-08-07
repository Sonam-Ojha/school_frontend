/** Public surface of the transport module. */

export { AssignStudentModal } from './components/AssignStudentModal';
export { ComplianceBadge, DocumentGrid } from './components/ComplianceBadge';
export { FleetStats } from './components/FleetStats';
export { GpsDeviceModal } from './components/GpsDeviceModal';
export { RouteFormModal } from './components/RouteFormModal';
export { RouteProgress } from './components/RouteProgress';
export { StopFormModal } from './components/StopFormModal';
export { StopList } from './components/StopList';
export { VehicleFormModal } from './components/VehicleFormModal';
export { buildVehicleColumns } from './components/vehicleColumns';

export {
  BLOCKING_DOCUMENTS,
  COMPLIANCE_LABELS,
  COMPLIANCE_TONES,
  DOCUMENT_EXPIRY_WARNING_DAYS,
  DOCUMENT_KINDS,
  DOCUMENT_LABELS,
  FUEL_TYPE_LABELS,
  FUEL_TYPE_OPTIONS,
  GPS_STATUS_LABELS,
  GPS_STATUS_TONES,
  LICENCE_EXPIRY_WARNING_DAYS,
  MAX_STOPS_PER_ROUTE,
  MAX_VEHICLE_CAPACITY,
  POSITION_STALE_SECONDS,
  TRACKING_POLL_MS,
  TRANSPORT_PERMISSIONS,
  TRIP_FARE_MULTIPLIER,
  TRIP_LABELS,
  TRIP_OPTIONS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_STATUS_TONES,
  complianceFor,
  worstCompliance,
} from './constants';

export {
  routeKeys,
  transportKeys,
  useAddStop,
  useAssignStudent,
  useAssignments,
  useCreateRoute,
  useCreateVehicle,
  useDeleteRoute,
  useDeleteVehicle,
  useDownloadRouteSheet,
  useDrivers,
  useExportVehicles,
  useGpsDevices,
  useRemoveGpsDevice,
  useRemoveStop,
  useReorderStop,
  useRoute,
  useRouteOptions,
  useRoutes,
  useSaveGpsDevice,
  useTransportSummary,
  useUnassignStudent,
  useUpdateRoute,
  useUpdateStop,
  useUpdateVehicle,
  useVehicle,
  useVehicleOptions,
  useVehiclePositions,
  useVehicles,
  vehicleKeys,
} from './hooks/useTransport';

export {
  transportService,
  type AssignmentQuery,
  type DriverSummary,
} from './services/transportService';

export {
  assignmentSchema,
  gpsDeviceSchema,
  routeSchema,
  stopSchema,
  stopSchemaWithCoordinates,
  vehicleSchema,
  type AssignmentInput,
  type GpsDeviceInput,
  type RouteInput,
  type StopInput,
  type VehicleInput,
} from './schemas';

export type {
  ComplianceStatus,
  DocumentKind,
  FuelType,
  GpsDevice,
  GpsStatus,
  RouteDetail,
  RouteStop,
  TransportAssignment,
  TransportRoute,
  TransportSummary,
  TripType,
  Vehicle,
  VehicleDocument,
  VehiclePosition,
  VehicleStatus,
} from './types';
