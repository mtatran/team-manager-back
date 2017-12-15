import { Entity, Column, OneToOne, JoinColumn } from 'typeorm'
import { Base } from './base'
import { User } from './user'
import { OAuthBearerWithRefresh } from '../types'

@Entity()
export class GoogleAuthentication extends Base implements OAuthBearerWithRefresh {
  @Column()
  refreshToken: string

  @Column()
  token: string

  @Column()
  tokenExpireDate: Date

  @OneToOne(type => User, user => user.googleAuth)
  @JoinColumn()
  user: User
}
