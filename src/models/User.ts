import { Entity, Column, OneToOne } from 'typeorm'
import { IsAlpha, Length, IsMobilePhone, IsEmail, IsOptional } from 'class-validator'
import Base from './Base'
import Team from './Team'
import { Authority, PositionLevel } from '../types'

export class UserPosition extends Base {
  @Column({ enum: PositionLevel })
  level: PositionLevel

  @OneToOne(type => Team, { eager: true })
  team: Team
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

  @Column({ default: false })
  slackAccess: boolean

  @Column({ unique: true, length: 50, default: null, nullable: true })
  slackTag: string

  @Column({ default: false })
  driveAccess: boolean

  @Column({ default: false })
  facebookAccess: boolean

  @Column(type => UserPosition)
  positions: UserPosition
}
