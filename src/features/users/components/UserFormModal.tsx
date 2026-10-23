import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Form, FormFullRow, FormGrid } from '@/components/form/Form';
import { FormCheckbox } from '@/components/form/FormCheckbox';
import { FormInput } from '@/components/form/FormInput';
import { FormMultiSelect } from '@/components/form/FormMultiSelect';
import { FormSelect } from '@/components/form/FormSelect';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useTeacherOptions } from '@/features/academics';
import { isSuperAdminRole } from '@/features/roles/constants';
import { useRoleOptions } from '@/features/roles/hooks/useRoles';
import type { Role } from '@/features/roles/types';
import { useStaffOptions } from '@/features/staff/hooks/useStaff';
import { useStudentOptions } from '@/features/students/hooks/useStudents';
import { applyServerErrors } from '@/lib/formErrors';
import { useAuthStore } from '@/store/authStore';
import { ROLES, roleLabel } from '@/types/auth';

import { useCreateUser, useUpdateUser } from '../hooks/useUsers';
import { createUserSchema, updateUserSchema, type UserInput } from '../schemas';
import type { UserWrite } from '../services/userService';
import type { UserAccount } from '../types';

// `roles` is what the API calls the field the form holds as `role_ids`.
const FIELDS = [
  'name',
  'email',
  'phone',
  'role_ids',
  'is_active',
  'password',
  'student_ids',
  'teacher_id',
  'staff_id',
] as const;
const FORM_ID = 'user-form';

/** Roles whose holders see only the students their account is linked to. */
const FAMILY_ROLES: readonly string[] = [ROLES.parent, ROLES.student];

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Omit to create. */
  user?: UserAccount | null;
}

export function UserFormModal({ isOpen, onClose, user = null }: UserFormModalProps) {
  const isEdit = user !== null;

  const createUser = useCreateUser();
  const updateUser = useUpdateUser(user?.id ?? 0);
  const mutation = isEdit ? updateUser : createUser;

  // The role picker needs the list before the form can hold a selection, so
  // the form itself mounts only once the roles have arrived.
  const roles = useRoleOptions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={isEdit ? `Edit ${user.name}` : 'New user'}
      description="A user is a sign-in. What they can do comes from the roles they hold."
      closeOnOverlayClick={!mutation.isPending}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            isLoading={mutation.isPending}
            disabled={!roles.data}
          >
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      {roles.data ? (
        <UserForm
          user={user}
          roles={roles.data}
          onSubmit={(values, onError) => mutation.mutate(values, { onSuccess: onClose, onError })}
        />
      ) : roles.error ? (
        <Alert tone="danger">The list of roles could not be loaded. Close this and try again.</Alert>
      ) : (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}
    </Modal>
  );
}

interface UserFormProps {
  user: UserAccount | null;
  roles: Role[];
  onSubmit: (values: UserWrite, onError: (error: Error) => void) => void;
}

function UserForm({ user, roles, onSubmit }: UserFormProps) {
  const isEdit = user !== null;
  const currentUser = useAuthStore((state) => state.user);
  const isSelf = isEdit && user.id === currentUser?.id;
  const isSuperAdmin = currentUser?.roles.includes(ROLES.superAdmin) ?? false;

  // Handing out the one role that bypasses every check is a super admin's call.
  const assignable = roles.filter((role) => isSuperAdmin || !isSuperAdminRole(role.name));
  const roleOptions = assignable.map((role) => ({ label: roleLabel(role.name), value: role.id }));

  const form = useForm<UserInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          role_ids: roles.filter((role) => user.roles.includes(role.name)).map((role) => role.id),
          is_active: user.is_active,
          password: '',
          student_ids: user.links?.student_ids ?? [],
          teacher_id: user.links?.teacher_id ?? null,
          staff_id: user.links?.staff_id ?? null,
        }
      : {
          name: '',
          email: '',
          phone: '',
          role_ids: [],
          is_active: true,
          password: '',
          student_ids: [],
          teacher_id: null,
          staff_id: null,
        },
  });

  const chosenRoles = roles
    .filter((role) => form.watch('role_ids').includes(role.id))
    .map((role) => role.name);
  const isFamily = chosenRoles.some((name) => FAMILY_ROLES.includes(name));
  const linkedStudents = form.watch('student_ids');

  // The rosters are only fetched for the pickers that are actually shown.
  const students = useStudentOptions(isFamily || linkedStudents.length > 0);
  const teachers = useTeacherOptions();
  const staff = useStaffOptions();
  const notLinked = { label: 'Not linked', value: '' };

  const submit = ({ role_ids, ...values }: UserInput) => {
    const touched = form.formState.dirtyFields;
    onSubmit(
      {
        ...values,
        roles: roles.filter((role) => role_ids.includes(role.id)).map((role) => role.name),
        // An edit always says who the account is. A new account says so only
        // if somebody chose — otherwise the API matches it by email address.
        sendLinks: isEdit || Boolean(touched.student_ids || touched.teacher_id || touched.staff_id),
      },
      (error) => {
        // The API reports role problems against `roles`; the picker is `role_ids`.
        const mapped = applyServerErrors(error, form.setError, FIELDS);
        if (!mapped) form.setError('root.serverError', { type: 'server', message: error.message });
      },
    );
  };

  return (
    <Form id={FORM_ID} form={form} onSubmit={submit}>
      <FormGrid cols={2}>
        <FormInput<UserInput> name="name" label="Full name" autoFocus required />
        <FormInput<UserInput>
          name="email"
          type="email"
          label="Email address"
          hint="They sign in with this."
          autoComplete="off"
          required
        />

        <FormInput<UserInput> name="phone" type="tel" label="Phone" placeholder="+91 98765 43210" />
        <FormInput<UserInput>
          name="password"
          type="password"
          label={isEdit ? 'New password' : 'Password'}
          hint={
            isEdit
              ? 'Leave blank to keep the current one. Setting one signs them out everywhere.'
              : 'At least 8 characters, with a letter and a number.'
          }
          autoComplete="new-password"
          required={!isEdit}
        />

        <FormFullRow>
          <FormMultiSelect<UserInput>
            name="role_ids"
            label="Roles"
            options={roleOptions}
            placeholder="Choose one or more roles"
            hint="Permissions from every role chosen are combined."
            required
          />
        </FormFullRow>

        {(isFamily || linkedStudents.length > 0) && (
          <FormFullRow>
            <FormMultiSelect<UserInput>
              name="student_ids"
              label={chosenRoles.includes(ROLES.parent) ? 'Their children' : 'The student this account is'}
              options={students.studentOptions}
              placeholder={students.isLoading ? 'Loading the roll…' : 'Choose from the student roll'}
              hint="A parent or student sees only the students chosen here — attendance, fees, results and the rest. With none chosen, they see nothing."
              emptyMessage="No active students found"
            />
            {isFamily && linkedStudents.length === 0 && (
              <Alert tone="warning" className="mt-2">
                {isEdit
                  ? 'No student is linked, so this account will open onto an empty page.'
                  : 'Leave this empty and the account is matched to the roll by its email address, where a guardian or student is recorded with the same one.'}
              </Alert>
            )}
          </FormFullRow>
        )}

        <FormSelect<UserInput>
          name="teacher_id"
          label="Teacher record"
          options={[notLinked, ...teachers.teacherOptions]}
          hint="For a teacher's own timetable, homework and leave."
          valueAsNumber
        />
        <FormSelect<UserInput>
          name="staff_id"
          label="Staff record"
          options={[notLinked, ...staff.staffOptions]}
          hint="For a staff member's own leave and attendance."
          valueAsNumber
        />

        <FormFullRow>
          {isSelf ? (
            <Alert tone="info">
              This is your own account, so it cannot be deactivated from here.
            </Alert>
          ) : (
            <FormCheckbox<UserInput>
              name="is_active"
              label="Allowed to sign in"
              description="Turn off to lock the account without deleting it. They are signed out at once."
            />
          )}
        </FormFullRow>
      </FormGrid>
    </Form>
  );
}
