export interface Roles {
  admin?: boolean
  google?: boolean
}

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
  id: number
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
  email: string
  message?: string
}

export type FilePermissionAction = FilePermissionChangeAction | FilePermissionDeleteAction |
  FilePermissionCreateAction

export interface ApiFindQuery<Model> {
  q?: string
  pageSize?: string
  page?: string
  order?: keyof Model
  orderDir?: 'ASC' | 'DESC'
}
