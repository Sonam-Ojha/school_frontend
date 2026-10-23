/** Public surface of the auth module. Other modules import from here only. */

export { ActiveSessionsCard } from './components/ActiveSessionsCard';
export { ChangePasswordForm } from './components/ChangePasswordForm';
export { PasswordRequirements } from './components/PasswordRequirements';
export { ProfileForm } from './components/ProfileForm';

export { useAuthSessions, useRevokeSession } from './hooks/useAuthSessions';
export { useDemoAccounts } from './hooks/useDemoAccounts';
export { useDemoLogin, useLogin } from './hooks/useLogin';
export { useLogout } from './hooks/useLogout';
export { useChangePassword, useForgotPassword, useResetPassword } from './hooks/usePasswordMutations';
export { useUpdateAvatar, useUpdateProfile } from './hooks/useProfile';
export { useSessionQuery } from './hooks/useSession';

export { resolveLandingPath } from './roleRoutes';
export { authService } from './services/authService';

export {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type UpdateProfileInput,
} from './schemas';

export type { AuthSessionToken, DemoAccount, LoginResponseData, MessageResponse } from './types';
