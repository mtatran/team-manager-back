import { Entity, Column, OneToMany } from 'typeorm'
import { IsAlpha, Length, IsMobilePhone, IsEmail, IsOptional } from 'class-validator'
import Base from './Base'
import Position from './Position'

export enum Authority {
  member = 'member',
  admin = 'admin'
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

  @OneToMany(type => Position, (position: Position) => position.user)
  positions: Promise<Position[]>

}
