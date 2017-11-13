import { ObjectID } from 'typeorm'

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
  read = 'read',
  write = 'write'
}
