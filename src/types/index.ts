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

export enum FilePermission {
  none = 'none',
  reader = 'reader',
  writer = 'writer',
  owner = 'owner'
}

export function permissionToNumber (permission: FilePermission) {
  switch (permission) {
    case FilePermission.none: return 0
    case FilePermission.reader: return 1
    case FilePermission.writer: return 2
    case FilePermission.owner: return 3
    default: throw new Error(`${permission} is not a valid FilePermission`)
  }
}

export function numberToPermission (num: number) {
  switch (num) {
    case 0: return FilePermission.none
    case 1: return FilePermission.reader
    case 2: return FilePermission.writer
    case 3: return FilePermission.owner
    default: throw new Error(`${num} is not a valid FilePermission level`)
  }
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
