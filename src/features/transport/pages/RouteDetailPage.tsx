import { ArrowLeft, FileDown, Pencil, Plus, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Can } from '@/components/ui/Can';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDisclosure } from '@/hooks/useDisclosure';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { formatTime } from '@/lib/time';
import { useAuthStore } from '@/store/authStore';

import { AssignStudentModal } from '../components/AssignStudentModal';
import { RouteFormModal } from '../components/RouteFormModal';
import { StopFormModal } from '../components/StopFormModal';
import { StopList } from '../components/StopList';
import { TRANSPORT_PERMISSIONS, TRIP_LABELS } from '../constants';
import {
  useAssignments,
  useDownloadRouteSheet,
  useRemoveStop,
  useReorderStop,
  useRoute,
  useUnassignStudent,
} from '../hooks/useTransport';
import type { RouteStop, TransportAssignment } from '../types';

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routeId = Number(id);

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canUpdate = hasPermission(TRANSPORT_PERMISSIONS.update);
  const canDelete = hasPermission(TRANSPORT_PERMISSIONS.delete);

  const { data: route, isLoading, error } = useRoute(id);
  const { data: assignments } = useAssignments({ route_id: routeId, per_page: 200 });

  const removeStop = useRemoveStop(routeId);
  const reorderStop = useReorderStop(routeId);
  const unassign = useUnassignStudent();
  const downloadSheet = useDownloadRouteSheet();

  const routeForm = useDisclosure();
  const stopForm = useDisclosure();
  const assignForm = useDisclosure();
  const deleteStopDialog = useDisclosure();
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null);
  const [pendingStop, setPendingStop] = useState<RouteStop | null>(null);
  const [pendingUnassign, setPendingUnassign] = useState<TransportAssignment | null>(null);
  const unassignDialog = useDisclosure();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !route) {
    return (
      <Card>
        <CardBody>
          <Alert tone="danger" title="Could not load this route">
            {error?.message ?? 'It no longer exists.'}
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(PATHS.transportRoutes)}
          >
            Back to routes
          </Button>
        </CardBody>
      </Card>
    );
  }

  const rows = assignments?.data ?? [];

  return (
    <>
      <PageHeader
        title={route.name}
        description={`${route.code}${route.distance_km ? ` · ${route.distance_km} km` : ''}${
          route.vehicle_name ? ` · ${route.vehicle_name}` : ' · no bus assigned'
        }`}
        breadcrumbs={[
          { label: 'Transport', to: PATHS.transportVehicles },
          { label: 'Routes', to: PATHS.transportRoutes },
          { label: route.name },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.transportRoutes)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>

            <Can permissions={[TRANSPORT_PERMISSIONS.print]}>
              <Button
                variant="outline"
                isLoading={downloadSheet.isPending}
                onClick={() => downloadSheet.mutate({ routeId, routeCode: route.code })}
                leftIcon={<FileDown className="size-4" />}
              >
                Route sheet
              </Button>
            </Can>

            <Can permissions={[TRANSPORT_PERMISSIONS.update]}>
              <Button onClick={routeForm.open} leftIcon={<Pencil className="size-4" />}>
                Edit route
              </Button>
            </Can>
          </>
        }
      />

      {!route.vehicle_id && (
        <Alert tone="warning" title="No bus on this route" className="mb-4">
          Nobody can be assigned to a route without a bus — there are no seats to count against.
        </Alert>
      )}

      <div className="mb-4 grid gap-4 sm:grid-cols-4">
        {[
          ['Stops', String(route.stops_count)],
          [
            'Runs',
            route.start_time && route.end_time
              ? `${formatTime(route.start_time)} – ${formatTime(route.end_time)}`
              : '—',
          ],
          ['Students', String(route.students_count)],
          [
            'Seats free',
            route.capacity === 0 ? '—' : `${route.seats_available} of ${route.capacity}`,
          ],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardBody>
              <p className="text-xs text-slate-500">{label}</p>
              <p
                className={cn(
                  'mt-0.5 text-lg font-semibold',
                  label === 'Seats free' && route.seats_available <= 0 && route.capacity > 0
                    ? 'text-amber-700'
                    : 'text-slate-900',
                )}
              >
                {value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Stops"
            description="In the order the bus visits them."
            actions={
              <Can permissions={[TRANSPORT_PERMISSIONS.create]}>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingStop(null);
                    stopForm.open();
                  }}
                  leftIcon={<Plus className="size-4" />}
                >
                  Add stop
                </Button>
              </Can>
            }
          />

          <CardBody className={route.stops.length === 0 ? undefined : 'p-0'}>
            <StopList
              stops={route.stops}
              canUpdate={canUpdate}
              canDelete={canDelete}
              isReordering={reorderStop.isPending}
              onEdit={(stop) => {
                setEditingStop(stop);
                stopForm.open();
              }}
              onDelete={(stop) => {
                setPendingStop(stop);
                deleteStopDialog.open();
              }}
              onMove={(stop, sequence) => reorderStop.mutate({ stopId: stop.id, sequence })}
            />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Students"
            description={`${rows.length} on this route`}
            actions={
              <Can permissions={[TRANSPORT_PERMISSIONS.create]}>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={route.stops.length === 0 || !route.vehicle_id}
                  title={
                    route.stops.length === 0
                      ? 'Add a stop first'
                      : !route.vehicle_id
                        ? 'Put a bus on the route first'
                        : undefined
                  }
                  onClick={assignForm.open}
                  leftIcon={<UserPlus className="size-4" />}
                >
                  Assign
                </Button>
              </Can>
            }
          />

          <CardBody className={rows.length === 0 ? undefined : 'p-0'}>
            {rows.length === 0 ? (
              <EmptyState
                icon={<UserPlus className="size-6" />}
                title="Nobody on this route"
                description="Assign students to a stop to build the pickup list."
              />
            ) : (
              <ul className="divide-y divide-slate-100">
                {rows.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <Avatar
                      name={assignment.student_name}
                      src={assignment.photo_url}
                      size="sm"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {assignment.student_name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {assignment.stop_name} · {assignment.class_name}
                        {assignment.section_name ? ` — ${assignment.section_name}` : ''}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(assignment.fare)}
                      </p>
                      {assignment.trip !== 'both' && (
                        <Badge tone="info">{TRIP_LABELS[assignment.trip]}</Badge>
                      )}
                    </div>

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        aria-label={`Take ${assignment.student_name} off this route`}
                        onClick={() => {
                          setPendingUnassign(assignment);
                          unassignDialog.open();
                        }}
                      >
                        <X className="size-4 text-slate-400" />
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      {routeForm.isOpen && (
        <RouteFormModal isOpen={routeForm.isOpen} onClose={routeForm.close} route={route} />
      )}

      {stopForm.isOpen && (
        <StopFormModal
          key={editingStop?.id ?? 'new'}
          isOpen={stopForm.isOpen}
          onClose={() => {
            stopForm.close();
            setEditingStop(null);
          }}
          route={route}
          stop={editingStop}
        />
      )}

      {assignForm.isOpen && (
        <AssignStudentModal isOpen={assignForm.isOpen} onClose={assignForm.close} route={route} />
      )}

      <ConfirmDialog
        isOpen={deleteStopDialog.isOpen}
        onClose={deleteStopDialog.close}
        onConfirm={() => {
          if (!pendingStop) return;
          removeStop.mutate(pendingStop.id, {
            onSuccess: () => {
              deleteStopDialog.close();
              setPendingStop(null);
            },
          });
        }}
        isLoading={removeStop.isPending}
        isDestructive
        title={`Remove ${pendingStop?.name ?? 'this stop'}?`}
        confirmLabel="Remove stop"
        message="The stops after it move up the run."
      />

      <ConfirmDialog
        isOpen={unassignDialog.isOpen}
        onClose={unassignDialog.close}
        onConfirm={() => {
          if (!pendingUnassign) return;
          unassign.mutate(pendingUnassign.id, {
            onSuccess: () => {
              unassignDialog.close();
              setPendingUnassign(null);
            },
          });
        }}
        isLoading={unassign.isPending}
        isDestructive
        title={`Take ${pendingUnassign?.student_name ?? 'this student'} off the route?`}
        confirmLabel="Take off route"
        message="Their seat frees up immediately and the monthly fare stops."
      />

      {/* The route sheet the driver carries, printed from this page. */}
      <div className="print-target hidden print:block">
        <h1 className="text-lg font-bold">
          {route.code} — {route.name}
        </h1>
        <p className="text-sm">
          {route.vehicle_name ?? 'No bus'} · {route.driver_name ?? 'No driver'}
        </p>
        <ol className="mt-4 space-y-1 text-sm">
          {[...route.stops]
            .sort((left, right) => left.sequence - right.sequence)
            .map((stop) => (
              <li key={stop.id}>
                {stop.sequence}. {stop.name} — {formatTime(stop.pickup_time)} (
                {stop.students_count} students)
              </li>
            ))}
        </ol>
      </div>
    </>
  );
}
