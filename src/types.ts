
export enum Authority {
  member = 'member',
  admin = 'admin',
  superAdmin = 'superAdmin'
}

export enum PositionLevel {
  member = 'member',
  coLead = 'coLead',
  lead = 'lead'
}

export interface JwtToken {
  id: Number
  email: string
  authority: Authority
}

export interface OAuthBearer {
  refreshToken: string
  token: string
  tokenExpireDate: Date
}

export interface OAuthBearerWithRefresh extends OAuthBearer {
  refreshToken: string
}

export enum FilePermission {
  none,
  reader,
  writer,
  owner
}

interface FilePermissionBaseAction {
  user: number
  fileId: string
}

interface FilePermissionChangeAction extends FilePermissionBaseAction {
  action: 'change'
  permissionId: string
  newPermission: FilePermission
}

interface FilePermissionDeleteAction extends FilePermissionBaseAction {
  permissionId: string
  action: 'delete'
}

interface FilePermissionCreateAction extends FilePermissionBaseAction {
  action: 'create'
  newPermission: FilePermission
}

export type FilePermissionAction = FilePermissionChangeAction | FilePermissionDeleteAction |
  FilePermissionCreateAction
