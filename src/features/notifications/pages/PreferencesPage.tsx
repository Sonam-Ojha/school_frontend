import { ArrowLeft, Mail, MessageSquare, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { PATHS } from '@/app/router/paths';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Checkbox';
import { Skeleton } from '@/components/ui/Skeleton';
import { useChannels } from '@/features/communication/hooks/useCommunication';
import { cn } from '@/lib/cn';

import { FALLBACK_TYPE_ICON, TYPE_ICONS } from '../constants';
import { useNotificationPreferences, useSavePreferences } from '../hooks/useNotifications';
import type { NotificationPreferences } from '../types';

/**
 * What you want, per kind of notification.
 *
 * In-app has no switch and that is deliberate: a record of what the school
 * told you is not a preference, and somebody who muted "fee due" and then
 * missed one would be right to say nobody told them. Email and SMS are opt-in
 * per kind, which is the only place a preference belongs.
 *
 * Channel availability is read from the communication module rather than
 * checked again here — SMTP credentials and the SMS provider live in
 * settings, and a second opinion about whether email works is a second thing
 * to go wrong.
 */
export default function PreferencesPage() {
  const navigate = useNavigate();
  const { data, isLoading, error } = useNotificationPreferences();
  const { channels } = useChannels();
  const save = useSavePreferences();

  const [draft, setDraft] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (data) setDraft(structuredClone(data));
  }, [data]);

  const smsChannel = channels.find((channel) => channel.channel === 'sms');
  const emailChannel = channels.find((channel) => channel.channel === 'email');

  const dirty = draft !== null && data !== undefined && JSON.stringify(draft) !== JSON.stringify(data);

  const patch = (type: string, key: 'email' | 'sms', value: boolean) => {
    setDraft((current) =>
      current === null
        ? current
        : {
            ...current,
            items: current.items.map((item) =>
              item.type === type ? { ...item, [key]: value } : item,
            ),
          },
    );
  };

  const setAll = (key: 'email' | 'sms', value: boolean) => {
    setDraft((current) =>
      current === null
        ? current
        : {
            ...current,
            items: current.items.map((item) =>
              (key === 'email' ? item.email_available : item.sms_available)
                ? { ...item, [key]: value }
                : item,
            ),
          },
    );
  };

  return (
    <>
      <PageHeader
        title="Notification preferences"
        description="Everything reaches you in the app. Choose what is also worth an email or a text."
        breadcrumbs={[
          { label: 'Notifications', to: PATHS.notifications },
          { label: 'Preferences' },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => navigate(PATHS.notifications)}
              leftIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>
            <Button
              disabled={!dirty}
              isLoading={save.isPending}
              onClick={() => draft && save.mutate(draft)}
              leftIcon={<Save className="size-4" />}
            >
              Save changes
            </Button>
          </>
        }
      />

      {error ? (
        <Card>
          <CardBody>
            <Alert tone="danger" title="Could not load your preferences">
              {error.message}
            </Alert>
          </CardBody>
        </Card>
      ) : isLoading || !draft ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-4">
          {(smsChannel?.status !== 'ready' || emailChannel?.status !== 'ready') && (
            <Alert tone="info" title="Not every channel is switched on">
              {[
                emailChannel?.status !== 'ready' ? `Email: ${emailChannel?.detail ?? 'not configured'}` : null,
                smsChannel?.status !== 'ready' ? `SMS: ${smsChannel?.detail ?? 'not configured'}` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              . Those rows are switched off until the school configures them in{' '}
              <Link to={PATHS.settingsEmail} className="font-medium underline">
                settings
              </Link>
              .
            </Alert>
          )}

          <Card>
            <CardHeader
              title="By kind"
              description="In-app is always on — it is the record of what you were told."
              actions={
                <div className="hidden gap-2 sm:flex">
                  <Button variant="ghost" size="sm" onClick={() => setAll('email', true)}>
                    All email
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setAll('email', false)}>
                    No email
                  </Button>
                </div>
              }
            />

            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium text-slate-600 sm:px-6">
                        Notification
                      </th>
                      <th scope="col" className="w-24 px-4 py-2.5 text-center font-medium text-slate-600">
                        In-app
                      </th>
                      <th scope="col" className="w-24 px-4 py-2.5 text-center font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail aria-hidden className="size-3.5" />
                          Email
                        </span>
                      </th>
                      <th scope="col" className="w-24 px-4 py-2.5 text-center font-medium text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageSquare aria-hidden className="size-3.5" />
                          SMS
                        </span>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {draft.items.map((item) => {
                      const Icon = TYPE_ICONS[item.type] ?? FALLBACK_TYPE_ICON;

                      return (
                        <tr key={item.type} className="hover:bg-slate-50">
                          <td className="px-4 py-3 sm:px-6">
                            <div className="flex items-start gap-2.5">
                              <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-slate-400" />
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900">{item.label}</p>
                                <p className="text-xs text-slate-500">{item.description}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            {/*
                              Rendered as a checked, disabled box rather than
                              omitted: "always on" is worth saying, and a blank
                              cell reads as "off".
                            */}
                            <Checkbox
                              checked
                              disabled
                              readOnly
                              aria-label={`${item.label} in the app — always on`}
                              className="mx-auto"
                            />
                          </td>

                          <td className={cn('px-4 py-3 text-center', !item.email_available && 'opacity-40')}>
                            <Checkbox
                              checked={item.email && item.email_available}
                              disabled={!item.email_available}
                              onChange={(event) => patch(item.type, 'email', event.target.checked)}
                              aria-label={`Email me about ${item.label.toLowerCase()}`}
                              className="mx-auto"
                            />
                          </td>

                          <td className={cn('px-4 py-3 text-center', !item.sms_available && 'opacity-40')}>
                            <Checkbox
                              checked={item.sms && item.sms_available}
                              disabled={!item.sms_available}
                              onChange={(event) => patch(item.type, 'sms', event.target.checked)}
                              aria-label={`Text me about ${item.label.toLowerCase()}`}
                              className="mx-auto"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Checkbox
                checked={draft.digest_only}
                onChange={(event) =>
                  setDraft((current) =>
                    current === null ? current : { ...current, digest_only: event.target.checked },
                  )
                }
                label="Send me one summary a day instead of each one as it happens"
                description="Urgent notifications still go straight out — a bus that has broken down cannot wait until the evening."
              />
            </CardBody>
          </Card>

          {draft.items.some((item) => item.sms && item.sms_available) && (
            <Alert tone="warning" title="Texts cost the school money">
              Every SMS is billed per segment. Worth keeping to the ones you would want to be
              woken for.
            </Alert>
          )}
        </div>
      )}
    </>
  );
}
