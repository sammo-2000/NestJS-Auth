import { UserRequest } from 'src/auth/auth.guard';

const ACTIONS = ['MANAGE', 'CREATE', 'READ', 'UPDATE', 'DELETE'] as const;

type Action = (typeof ACTIONS)[number];

const createPermissions = <T extends string>(...resources: T[]) => {
  return resources.reduce(
    (acc, resource) => {
      acc[resource] = ACTIONS.reduce(
        (actions, action) => {
          actions[action] = `${action}_${resource}`;
          return actions;
        },
        {} as Record<Action, string>,
      );

      return acc;
    },
    {} as Record<T, Record<Action, string>>,
  );
};

/*
{
  ACCOUNT: {
    MANAGE: 'MANAGE_ACCOUNT',
    CREATE: 'CREATE_ACCOUNT',
    READ: 'READ_ACCOUNT',
    UPDATE: 'UPDATE_ACCOUNT',
    DELETE: 'DELETE_ACCOUNT'
  }
}
*/
export const Permissions = createPermissions('ACCOUNT', 'ROLE');

/*
[
  'MANAGE_ACCOUNT',
  'CREATE_ACCOUNT',
  'READ_ACCOUNT',
  'UPDATE_ACCOUNT',
  'DELETE_ACCOUNT'
]
*/
export const AllPermissions = Object.values(Permissions).flatMap((resource) =>
  Object.values(resource),
);

export type PermissionType =
  (typeof Permissions)[keyof typeof Permissions][keyof (typeof Permissions)[
    | 'ACCOUNT'
    | 'ROLE']];

export function hasAccess(user: UserRequest, permission: PermissionType) {
  return user.role.permissions.includes(permission);
}
