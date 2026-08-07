import { ArrowLeft, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { formatNumber } from '@/lib/format';

import { DocumentGrid } from '../components/ComplianceBadge';
import { VehicleFormModal } from '../components/VehicleFormModal';
import {
  BLOCKING_DOCUMENTS,
  DOCUMENT_LABELS,
  FUEL_TYPE_LABELS,
  TRANSPORT_PERMISSIONS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONES,
} from '../constants';
import { useVehicle } from '../hooks/useTransport';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: vehicle, isLoading, error } = useVehicle(id);
  const editForm = useDisclosure();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this bus">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.transportVehicles)}
          >
            Back to the fleet
          </Button>
        </CardBody>
      </Card>
    );
  }

  const blocking = vehicle.documents.filter(
    (document) => BLOCKING_DOCUMENTS.includes(document.kind) && document.status === 'expired',
  );

  return (
    <>
      <PageHeader
        title={vehicle.name}
        description={`${vehicle.registration_no}${vehicle.model ? ` · ${vehicle.make ?? ''} ${vehicle.model}`.trimEnd() : ''}`}
        breadcrumbs={[
          { label: 'Transport', to: PATHS.transportVehicles },
          { label: vehicle.name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.transportVehicles)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>
            <Can permissions={[TRANSPORT_PERMISSIONS.update]}>
              <Button onClick={editForm.open} leftIcon={<Pencil className="size-4" />}>
                Edit
              </Button>
            </Can>
          </>
        }
      />

      {blocking.length > 0 && (
        <Alert tone="danger" title="This bus cannot legally carry children" className="mb-4">
          {blocking.map((document) => DOCUMENT_LABELS[document.kind]).join(' and ')} has lapsed.
          It has to come off its route until renewed.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Details" />
          <CardBody>
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              {[
                ['Registration', vehicle.registration_no],
                ['Seats', String(vehicle.capacity)],
                ['Fuel', FUEL_TYPE_LABELS[vehicle.fuel_type]],
                ['Year', vehicle.manufacture_year === null ? '—' : String(vehicle.manufacture_year)],
                [
                  'Odometer',
                  vehicle.odometer_km === null ? '—' : `${formatNumber(vehicle.odometer_km)} km`,
                ],
                ['Route', vehicle.route_name ?? 'Not on a route'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="truncate text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>

            {vehicle.notes && (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {vehicle.notes}
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Crew" />
          <CardBody className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">Driver</p>
              {vehicle.driver_name ? (
                <>
                  <p className="text-sm font-medium text-slate-900">{vehicle.driver_name}</p>
                  {vehicle.driver_phone && (
                    <p className="text-xs text-slate-500">{vehicle.driver_phone}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-amber-700">Nobody assigned</p>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500">Attendant</p>
              <p className="text-sm text-slate-900">{vehicle.attendant_name ?? '—'}</p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">Status</p>
              <Badge tone={VEHICLE_STATUS_TONES[vehicle.status]} withDot className="mt-1">
                {VEHICLE_STATUS_LABELS[vehicle.status]}
              </Badge>
            </div>
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Statutory papers"
            description="Insurance and fitness are the two that stop a bus running."
          />
          <CardBody>
            <DocumentGrid documents={vehicle.documents} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tracker" />
          <CardBody>
            {vehicle.gps_imei ? (
              <>
                <p className="text-xs text-slate-500">IMEI</p>
                <code className="text-sm text-slate-900">{vehicle.gps_imei}</code>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  fullWidth
                  onClick={() => navigate(PATHS.transportTracking)}
                >
                  See it on the live view
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No tracker fitted. Register one on the live tracking screen to follow this bus.
              </p>
            )}

            {vehicle.route_id && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                fullWidth
                onClick={() =>
                  navigate(toPath(PATHS.transportRouteDetail, { id: vehicle.route_id! }))
                }
              >
                Open {vehicle.route_name}
              </Button>
            )}
          </CardBody>
        </Card>
      </div>

      {editForm.isOpen && (
        <VehicleFormModal isOpen={editForm.isOpen} onClose={editForm.close} vehicle={vehicle} />
      )}
    </>
  );
}
