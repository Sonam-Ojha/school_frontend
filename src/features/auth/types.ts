import type { AuthUser } from '@/types/auth';

/** `POST /auth/login` success body. `token` is null in Sanctum cookie mode. */
export interface LoginResponseData {
  user: AuthUser;
  token: string | null;
  /** ISO timestamp; present when the backend issues expiring tokens. */
  expires_at?: string | null;
}

/**
 * One issued Sanctum personal access token, as listed by `GET /auth/sessions`.
 * Powers the "signed-in devices" panel on the profile page.
 */
export interface AuthSessionToken {
  id: number;
  name: string;
  ip_address: string | null;
  user_agent: string | null;
  last_used_at: string | null;
  created_at: string;
  /** True for the token authenticating the current request. */
  is_current: boolean;
}

/** Generic `{ message }` acknowledgement returned by the password endpoints. */
export interface MessageResponse {
  message: string;
}
