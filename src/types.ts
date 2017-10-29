import { ObjectID } from 'typeorm'

export enum Authority {
  member = 'member',
  admin = 'admin'
}

export enum PositionLevel {
  member = 'member',
  coLead = 'coLead',
  lead = 'lead'
}

export interface JwtToken {
  id: ObjectID
  email: string
  authority: Authority
}

export interface OAuthBearer {
  refreshToken: string
  token: string
  tokenExpireDate: Date
}
