import { IdCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PATHS, toPath } from '@/app/router/paths';
import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/format';

import { LICENCE_EXPIRY_WARNING_DAYS } from '../constants';
import { useDrivers } from '../hooks/useTransport';

/**
 * The driver roster.
 *
 * Read from the staff module — these *are* staff records, with the licence
 * the staff form already captures. Transport adds only what transport knows:
 * which bus they are on and whether that licence still lets them drive it.
 * Editing a driver happens on their staff profile, which is where a second
 * edit form would otherwise have started to drift from the first.
 */
export default function DriversPage() {
  const navigate = useNavigate();
  const { drivers, isLoading } = useDrivers();

  const grounded = drivers.filter((driver) => !driver.can_drive);
  const expiringSoon = drivers.filter(
    (driver) =>
      driver.can_drive &&
      driver.licence_days_remaining !== null &&
      driver.licence_days_remaining <= LICENCE_EXPIRY_WARNING_DAYS,
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grounded.length > 0 && (
        <Alert
          tone="danger"
          title={`${grounded.length} driver${grounded.length === 1 ? '' : 's'} cannot drive`}
        >
          {grounded.map((driver) => driver.full_name).join(', ')} — a lapsed licence or not in
          service. They cannot be assigned to a bus.
        </Alert>
      )}

      {expiringSoon.length > 0 && (
        <Alert tone="warning" title="Licences coming up for renewal">
          {expiringSoon
            .map((driver) => `${driver.full_name} (${driver.licence_days_remaining} days)`)
            .join(', ')}
        </Alert>
      )}

      <Card>
        <CardHeader
          title="Drivers"
          description="Staff cleared to drive, and what each is on. Edit a driver on their staff profile."
        />

        <CardBody className={drivers.length === 0 ? undefined : 'p-0'}>
          {drivers.length === 0 ? (
            <EmptyState
              icon={<IdCard className="size-6" />}
              title="No drivers"
              description="Add staff with the driver role, and record their licence."
            />
          ) : (
            <div className="scrollbar-thin overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                    <th scope="col" className="px-4 py-2 text-left">Driver</th>
                    <th scope="col" className="hidden px-3 py-2 text-left sm:table-cell">Licence</th>
                    <th scope="col" className="px-3 py-2 text-left">Expires</th>
                    <th scope="col" className="hidden px-3 py-2 text-left md:table-cell">Bus</th>
                    <th scope="col" className="hidden px-3 py-2 text-left lg:table-cell">Route</th>
                    <th scope="col" className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {drivers.map((driver) => {
                    const days = driver.licence_days_remaining;
                    const expiring =
                      days !== null && days >= 0 && days <= LICENCE_EXPIRY_WARNING_DAYS;

                    return (
                      <tr key={driver.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-3">
                            <Avatar name={driver.full_name} src={driver.photo_url} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">
                                {driver.full_name}
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                <code>{driver.employee_id}</code> · {driver.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-3 py-2 sm:table-cell">
                          {driver.licence_number ? (
                            <code className="text-xs text-slate-700">{driver.licence_number}</code>
                          ) : (
                            <span className="text-xs text-red-600">Not recorded</span>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          {driver.licence_expiry ? (
                            <div>
                              <p className="text-sm whitespace-nowrap text-slate-800">
                                {formatDate(driver.licence_expiry)}
                              </p>
                              <p
                                className={cn(
                                  'text-xs whitespace-nowrap',
                                  days !== null && days < 0
                                    ? 'font-medium text-red-600'
                                    : expiring
                                      ? 'font-medium text-amber-700'
                                      : 'text-slate-500',
                                )}
                              >
                                {days === null
                                  ? ''
                                  : days < 0
                                    ? `lapsed ${Math.abs(days)} days ago`
                                    : `${days} days left`}
                              </p>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>

                        <td className="hidden px-3 py-2 md:table-cell">
                          {driver.vehicle_id ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  toPath(PATHS.transportVehicleDetail, { id: driver.vehicle_id! }),
                                )
                              }
                            >
                              {driver.vehicle_registration}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">Not assigned</span>
                          )}
                        </td>

                        <td className="hidden px-3 py-2 text-slate-700 lg:table-cell">
                          {driver.route_name ?? '—'}
                        </td>

                        <td className="px-4 py-2 text-right">
                          {driver.can_drive ? (
                            <Badge tone="success" withDot>
                              Cleared
                            </Badge>
                          ) : (
                            <Badge tone="danger" withDot>
                              {driver.blocked_reason}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
