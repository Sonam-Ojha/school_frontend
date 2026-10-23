import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck, UserMinus } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';

import { platformApi, platformKeys } from '../api';
import { announce, announceError, Field, fieldError, SELECT_CLASS } from '../components/shared';
import { usePlatformAuth } from '../store';
import type { PlatformRole, PlatformUser, TeamInput } from '../types';

/** `/superadmin/team`: the platform's own staff and what each role may do. */
export default function TeamPage() {
  const me = usePlatformAuth((state) => state.user);
  const queryClient = useQueryClient();
  const team = useQuery({ queryKey: platformKeys.team(), queryFn: ({ signal }) => platformApi.team(signal) });
  const meta = useQuery({ queryKey: platformKeys.meta(), queryFn: ({ signal }) => platformApi.meta(signal), staleTime: 10 * 60_000 });
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<PlatformUser | null>(null);
  const [form, setForm] = useState<TeamInput>({ name: '', email: '', role: 'support', password: '' });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: platformKeys.all });
  const add = useMutation({
    mutationFn: () => platformApi.addTeamMember(form),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setAdding(false);
      setForm({ name: '', email: '', role: 'support', password: '' });
      refresh();
    },
  });
  const update = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { role?: PlatformRole; is_active?: boolean } }) => platformApi.updateTeamMember(id, patch),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      refresh();
    },
    onError: announceError,
  });
  const remove = useMutation({
    mutationFn: (user: PlatformUser) => platformApi.removeTeamMember(user.id),
    meta: { skipGlobalError: true },
    onSuccess: (result) => {
      announce(result);
      setRemoving(null);
      refresh();
    },
    onError: (error) => {
      setRemoving(null);
      announceError(error);
    },
  });
  const error = (field: string) => fieldError(add.error, field);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team & roles"
        description="The people who run the platform. Each role sees and does only its part of the console."
        actions={<Button leftIcon={<Plus className="size-4" />} onClick={() => setAdding(true)}>Add member</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(meta.data?.roles ?? []).map((role) => (
          <Card key={role.key}>
            <CardBody>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand-600" aria-hidden />
                <h3 className="font-semibold text-slate-900">{role.label}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">{role.description}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Members" />
        <CardBody className="p-0">
          {team.isPending ? (
            <Skeleton className="m-4 h-32" />
          ) : team.isError ? (
            <Alert tone="danger" className="m-4">
              {team.error.message}
            </Alert>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Member</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Last sign-in</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.data.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900">
                        {member.name}
                        {member.id === me?.id && <span className="text-slate-400"> (you)</span>}
                      </p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </td>
                    <td className="px-6 py-3">
                      <select
                        className={`${SELECT_CLASS} w-40`}
                        value={member.role}
                        disabled={member.id === me?.id}
                        onChange={(event) => update.mutate({ id: member.id, patch: { role: event.target.value as PlatformRole } })}
                        aria-label={`Role of ${member.name}`}
                      >
                        {(meta.data?.roles ?? []).map((role) => (
                          <option key={role.key} value={role.key}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{member.last_login_at ? formatDateTime(member.last_login_at) : 'Never'}</td>
                    <td className="px-6 py-3">
                      <button
                        type="button"
                        disabled={member.id === me?.id}
                        onClick={() => update.mutate({ id: member.id, patch: { is_active: !member.is_active } })}
                        className="disabled:cursor-not-allowed"
                      >
                        <Badge tone={member.is_active ? 'success' : 'neutral'}>{member.is_active ? 'Active' : 'Deactivated'}</Badge>
                      </button>
                    </td>
                    <td className="px-6 py-3 text-right">
                      {member.id !== me?.id && (
                        <Button variant="ghost" size="sm" iconOnly aria-label={`Remove ${member.name}`} leftIcon={<UserMinus className="size-4" />} onClick={() => setRemoving(member)} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={adding}
        onClose={() => setAdding(false)}
        title="Add a team member"
        footer={
          <>
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={() => add.mutate()} isLoading={add.isPending}>
              Add member
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" required error={error('name')}>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Email" required error={error('email')}>
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          </Field>
          <Field label="Role" required error={error('role')}>
            <select className={SELECT_CLASS} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as PlatformRole })}>
              {(meta.data?.roles ?? []).map((role) => (
                <option key={role.key} value={role.key}>
                  {role.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Password" required error={error('password')} hint="8+ characters with a letter and a number. Share it with them privately.">
            <Input type="text" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={removing !== null}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing)}
        title={`Remove ${removing?.name ?? ''}?`}
        message="They are signed out and can no longer open the console."
        confirmLabel="Remove"
        isDestructive
        isLoading={remove.isPending}
      />
    </div>
  );
}
