/** Shapes for Spatie's `roles` and `permissions` tables. */

export interface Role {
  id: number;
  /** Slug used by Spatie, e.g. `school-admin`. */
  name: string;
  guard_name: string;
  /**
   * Seeded roles the API refuses to rename or delete. The UI mirrors that so
   * the action is never offered in the first place.
   */
  is_system: boolean;
  users_count: number;
  permissions_count: number;
  created_at: string;
  updated_at: string;
}

/** `GET /roles/{id}` — adds the assigned permission names. */
export interface RoleDetail extends Role {
  permissions: string[];
  /** Groups of sensitive details the server blanks out for this role. */
  hidden_fields?: string[];
}

export interface Permission {
  id: number;
  /** `resource.action`, e.g. `students.create`. */
  name: string;
  guard_name: string;
  /** Roles holding this permission. Present only when the API includes it. */
  roles?: string[];
  created_at: string;
}

/** Write payload for create and update. */
export interface RolePayload {
  name: string;
  permissions: string[];
  hidden_fields: string[];
}

/** One permission, split into its addressable parts for the matrix UI. */
export interface ParsedPermission {
  id: number;
  name: string;
  /** Everything before the final dot, e.g. `academics.classes`. */
  resource: string;
  /** The final segment, e.g. `create`. */
  action: string;
}

/** All permissions for a single resource, keyed by action. */
export interface PermissionGroup {
  resource: string;
  label: string;
  /** action → permission name. Absent actions are not offered for that resource. */
  byAction: Record<string, string>;
  /** Every permission name in this group, for the row-level toggle. */
  names: string[];
}
