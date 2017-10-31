import { Entity, Column, ObjectID } from 'typeorm'
import { IsAlpha, Length, IsMobilePhone, IsEmail, IsOptional, IsBoolean, IsString } from 'class-validator'
import Base from './base'
import Team from './team'
import { Authority, PositionLevel, OAuthBearer } from '../types'

export class UserPosition extends Base {
  @Column({ enum: PositionLevel })
  level: PositionLevel

  @Column()
  teamId: ObjectID

  team?: Team
}

export class GoogleAuthentication implements OAuthBearer {
  @Column()
  refreshToken: string

  @Column()
  token: string

  @Column()
  tokenExpireDate: Date
}

@Entity()
export default class User extends Base {
  @IsAlpha({message: 'You can only have letters in your name'})
  @Column()
  firstName: string

  @IsAlpha({message: 'You can only have letters in your name'})
  @Column()
  @Column()
  lastName: string

  @Length(60, 60)
  @Column({ length: 60 })
  password: string

  @IsOptional()
  @Column({ nullable: true })
  address: string

  @IsOptional()
  @IsMobilePhone('en-CA')
  @Column({ nullable: true })
  phoneNumber: string

  @IsEmail()
  @Column({ unique: true, length: 100 })
  email: string

  @Column('enum', { enum: Authority, default: Authority.member })
  authority: Authority

  @IsBoolean()
  @Column({ default: false })
  slackAccess: boolean = false

  @IsOptional()
  @IsString()
  @Column({ unique: true, length: 50, default: null, nullable: true })
  slackTag: string

  @Column(type => GoogleAuthentication)
  googleAuth?: GoogleAuthentication

  @IsBoolean()
  @Column({ default: false })
  driveAccess: boolean = false

  @IsBoolean()
  @Column({ default: false })
  facebookAccess: boolean = false

  @Column(type => UserPosition)
  positions: UserPosition[] = []
}
