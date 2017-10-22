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
  id: number
  email: string
  authority: Authority
}
