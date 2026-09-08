import { UserRoleENUM } from '../user/user.type';

export const ALL_USER = 'ALL_USER';

export const hardcodedPermissions: Record<string, string[]> = {
  [ALL_USER]: ['route_name:*'],

  [UserRoleENUM.TEST]: ['route_name:*', 'route_name:read'],
};
