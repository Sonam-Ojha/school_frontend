import type { FuelType, VehicleStatus } from '@/features/transport/types';

/**
 * Transport seed for the development mock.
 *
 * Buses, routes and stops. Drivers are not seeded here — they are staff, and
 * the mock reads them from the staff roster. Student assignments are minted
 * by `devApi` from the live student list, because an assignment hard-coded
 * against a student id breaks the moment the seed moves.
 *
 * Document expiry dates are relative to today so a fresh clone always has one
 * bus grounded by lapsed insurance, one with papers about to run out and the
 * rest in order — a fixed calendar would put the whole fleet in one state and
 * the compliance banner would never fire.
 */

const dayOffset = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export interface VehicleSeed {
  id: number;
  registration_no: string;
  name: string;
  make: string;
  model: string;
  manufacture_year: number;
  capacity: number;
  fuel_type: FuelType;
  status: VehicleStatus;
  /** Days from today each paper expires. Null means nothing recorded. */
  insurance: number | null;
  fitness: number | null;
  permit: number | null;
  pollution: number | null;
  odometer_km: number;
  notes: string | null;
}

export const vehicleSeed: VehicleSeed[] = [
  {
    id: 1,
    registration_no: 'KA05MH1234',
    name: 'Bus 1',
    make: 'Tata',
    model: 'Starbus Ultra',
    manufacture_year: 2021,
    capacity: 45,
    fuel_type: 'diesel',
    status: 'active',
    insurance: 210,
    fitness: 160,
    permit: 300,
    pollution: 120,
    odometer_km: 84_500,
    notes: null,
  },
  {
    id: 2,
    registration_no: 'KA05MH5678',
    name: 'Bus 2',
    make: 'Ashok Leyland',
    model: 'Sunshine',
    manufacture_year: 2020,
    capacity: 40,
    fuel_type: 'diesel',
    status: 'active',
    insurance: 95,
    fitness: 240,
    permit: 180,
    pollution: 60,
    odometer_km: 121_300,
    notes: null,
  },
  {
    id: 3,
    registration_no: 'KA05MJ4411',
    name: 'Bus 3',
    make: 'Force',
    model: 'Traveller School',
    manufacture_year: 2022,
    capacity: 26,
    fuel_type: 'diesel',
    status: 'active',
    // Pollution certificate about to run out — the amber state.
    insurance: 150,
    fitness: 190,
    permit: 220,
    pollution: 11,
    odometer_km: 46_900,
    notes: 'Used for the short town route.',
  },
  {
    id: 4,
    registration_no: 'KA05MK7788',
    name: 'Bus 4',
    make: 'Tata',
    model: 'Starbus 40',
    manufacture_year: 2018,
    capacity: 42,
    fuel_type: 'diesel',
    status: 'active',
    // Insurance has lapsed: this bus cannot legally carry children.
    insurance: -12,
    fitness: 130,
    permit: 260,
    pollution: 90,
    odometer_km: 168_400,
    notes: 'Insurance renewal submitted, awaiting the policy document.',
  },
  {
    id: 5,
    registration_no: 'KA05ML2020',
    name: 'Bus 5',
    make: 'Eicher',
    model: 'Skyline Pro',
    manufacture_year: 2023,
    capacity: 50,
    fuel_type: 'cng',
    status: 'active',
    insurance: 320,
    fitness: 280,
    permit: 340,
    pollution: 200,
    odometer_km: 22_100,
    notes: null,
  },
  {
    id: 6,
    registration_no: 'KA05MN9090',
    name: 'Bus 6',
    make: 'Tata',
    model: 'Starbus',
    manufacture_year: 2017,
    capacity: 40,
    fuel_type: 'diesel',
    status: 'maintenance',
    // In the workshop, and nobody has recorded its permit — the "missing" state.
    insurance: 60,
    fitness: 45,
    permit: null,
    pollution: 30,
    odometer_km: 205_700,
    notes: 'Gearbox overhaul. Off the road until the end of the month.',
  },
  {
    id: 7,
    registration_no: 'KA05MP1111',
    name: 'Bus 7',
    make: 'Mahindra',
    model: 'Cruzio School',
    manufacture_year: 2015,
    capacity: 32,
    fuel_type: 'diesel',
    status: 'retired',
    insurance: -400,
    fitness: -380,
    permit: -350,
    pollution: -420,
    odometer_km: 312_000,
    notes: 'Sold. Kept on the register for the audit trail.',
  },
];

export interface StopSeed {
  name: string;
  landmark: string | null;
  pickup: string;
  drop: string;
  fare: number;
  /** Null for a stop nobody has surveyed — a real and common state. */
  lat: number | null;
  lng: number | null;
}

export interface RouteSeed {
  id: number;
  name: string;
  code: string;
  description: string | null;
  /** Index into `vehicleSeed`, or null for a route with no bus yet. */
  vehicleId: number | null;
  distance_km: number | null;
  is_active: boolean;
  stops: StopSeed[];
}

export const routeSeed: RouteSeed[] = [
  {
    id: 1,
    name: 'Jayanagar — Banashankari',
    code: 'R-01',
    description: 'South city loop via Kanakapura Road.',
    vehicleId: 1,
    distance_km: 18.5,
    is_active: true,
    stops: [
      { name: 'Jayanagar 4th Block', landmark: 'Opposite the post office', pickup: '06:45', drop: '15:40', fare: 1400, lat: 12.925, lng: 77.5938 },
      { name: 'South End Circle', landmark: 'Near the metro entrance', pickup: '06:55', drop: '15:52', fare: 1400, lat: 12.9345, lng: 77.5806 },
      { name: 'Banashankari 2nd Stage', landmark: 'BDA complex', pickup: '07:08', drop: '16:05', fare: 1300, lat: 12.9255, lng: 77.5468 },
      { name: 'Kathriguppe', landmark: 'Water tank junction', pickup: '07:20', drop: '16:18', fare: 1300, lat: 12.9337, lng: 77.5426 },
      { name: 'Padmanabhanagar', landmark: null, pickup: '07:32', drop: '16:30', fare: 1200, lat: 12.9161, lng: 77.5581 },
    ],
  },
  {
    id: 2,
    name: 'Indiranagar — Koramangala',
    code: 'R-02',
    description: 'East city, via 100 Feet Road.',
    vehicleId: 2,
    distance_km: 14.2,
    is_active: true,
    stops: [
      { name: 'Indiranagar 100 Feet Road', landmark: 'Near the metro pillar 78', pickup: '06:50', drop: '15:45', fare: 1500, lat: 12.9719, lng: 77.6412 },
      { name: 'Domlur', landmark: 'Bus depot', pickup: '07:02', drop: '15:58', fare: 1450, lat: 12.9611, lng: 77.6387 },
      { name: 'Ejipura Signal', landmark: null, pickup: '07:15', drop: '16:12', fare: 1400, lat: 12.9401, lng: 77.6262 },
      { name: 'Koramangala 5th Block', landmark: 'Forum mall gate', pickup: '07:28', drop: '16:26', fare: 1400, lat: 12.9345, lng: 77.6139 },
    ],
  },
  {
    id: 3,
    name: 'Malleshwaram — Yeshwanthpur',
    code: 'R-03',
    description: null,
    vehicleId: 5,
    distance_km: 11.8,
    is_active: true,
    stops: [
      { name: 'Malleshwaram 8th Cross', landmark: 'Mantri Square side gate', pickup: '06:55', drop: '15:50', fare: 1350, lat: 13.0033, lng: 77.5712 },
      { name: 'Rajajinagar Entrance', landmark: null, pickup: '07:07', drop: '16:02', fare: 1350, lat: 12.9915, lng: 77.5551 },
      // Never surveyed — the "no coordinates" warning on the stop list.
      { name: 'Yeshwanthpur Circle', landmark: 'Near the railway station', pickup: '07:22', drop: '16:16', fare: 1250, lat: null, lng: null },
      { name: 'Mathikere', landmark: 'MS Ramaiah gate', pickup: '07:35', drop: '16:30', fare: 1250, lat: 13.0301, lng: 77.5641 },
    ],
  },
  {
    id: 4,
    name: 'Whitefield shuttle',
    code: 'R-04',
    description: 'Small bus, short run.',
    vehicleId: 3,
    distance_km: 8.4,
    is_active: true,
    stops: [
      { name: 'Whitefield Main Road', landmark: null, pickup: '07:05', drop: '15:55', fare: 1600, lat: 12.9698, lng: 77.7499 },
      { name: 'Kundalahalli Gate', landmark: 'Opposite the church', pickup: '07:18', drop: '16:08', fare: 1550, lat: 12.9611, lng: 77.7128 },
      { name: 'Marathahalli Bridge', landmark: null, pickup: '07:30', drop: '16:22', fare: 1500, lat: 12.9591, lng: 77.6974 },
    ],
  },
  {
    id: 5,
    name: 'Hebbal — Yelahanka',
    code: 'R-05',
    description: 'Planned for next term — no bus assigned yet.',
    vehicleId: null,
    distance_km: 16.0,
    is_active: true,
    stops: [
      { name: 'Hebbal Flyover', landmark: 'Under the flyover, north side', pickup: '06:40', drop: '15:45', fare: 1500, lat: 13.0358, lng: 77.5970 },
      { name: 'Jakkur', landmark: null, pickup: '06:55', drop: '16:00', fare: 1450, lat: 13.0715, lng: 77.5990 },
    ],
  },
  {
    id: 6,
    name: 'Old town circular',
    code: 'R-06',
    description: 'Suspended while the road is dug up.',
    vehicleId: null,
    distance_km: 9.5,
    is_active: false,
    stops: [
      { name: 'Market Square', landmark: null, pickup: '07:00', drop: '15:50', fare: 1100, lat: 12.9634, lng: 77.5855 },
      { name: 'Fort Road', landmark: null, pickup: '07:12', drop: '16:02', fare: 1100, lat: 12.9611, lng: 77.5747 },
    ],
  },
];

export interface GpsDeviceSeed {
  id: number;
  imei: string;
  sim_number: string | null;
  provider: string;
  /** Index into `vehicleSeed`, or null for a spare on the shelf. */
  vehicleId: number | null;
  /** Minutes ago the device last reported. Null means it never has. */
  lastPingMinutesAgo: number | null;
}

export const gpsDeviceSeed: GpsDeviceSeed[] = [
  { id: 1, imei: '860123456789012', sim_number: '+91 90000 10001', provider: 'Teltonika FMB920', vehicleId: 1, lastPingMinutesAgo: 0 },
  { id: 2, imei: '860123456789013', sim_number: '+91 90000 10002', provider: 'Teltonika FMB920', vehicleId: 2, lastPingMinutesAgo: 1 },
  { id: 3, imei: '860123456789014', sim_number: '+91 90000 10003', provider: 'Concox GT06N', vehicleId: 3, lastPingMinutesAgo: 2 },
  // Stopped reporting an hour ago — the offline alert.
  { id: 4, imei: '860123456789015', sim_number: '+91 90000 10004', provider: 'Concox GT06N', vehicleId: 5, lastPingMinutesAgo: 65 },
  // Fitted to the bus in the workshop; parked, so idle rather than offline.
  { id: 5, imei: '860123456789016', sim_number: null, provider: 'Teltonika FMB920', vehicleId: 6, lastPingMinutesAgo: 4 },
  // A spare in the drawer.
  { id: 6, imei: '860123456789017', sim_number: null, provider: 'Teltonika FMB920', vehicleId: null, lastPingMinutesAgo: null },
];

export const documentDate = dayOffset;

export const nextVehicleId = vehicleSeed.length + 1;
export const nextRouteId = routeSeed.length + 1;
export const nextGpsDeviceId = gpsDeviceSeed.length + 1;
