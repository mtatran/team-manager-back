import { Entity, Column } from 'typeorm'
import Base from './base'
import { OAuthBearerWithRefresh } from '../types'

@Entity()
export default class GoogleAuthentication extends Base implements OAuthBearerWithRefresh {
  @Column()
  refreshToken: string

  @Column()
  token: string

  @Column()
  tokenExpireDate: Date
}
