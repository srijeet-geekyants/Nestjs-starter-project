export enum RoleCode {
  'OWNER',
  'ADMIN',
  'USER',
}

export const RoleName: Record<RoleCode, string> = {
  [RoleCode.OWNER]: 'Owner',
  [RoleCode.ADMIN]: 'Admin',
  [RoleCode.USER]: 'User',
};
