import { Entity, Column, OneToOne, OneToMany } from 'typeorm'
import { IsAlpha, Length, IsMobilePhone, IsEmail, IsOptional, IsBoolean, IsString } from 'class-validator'
import { Base } from './base'
import { GoogleAuthentication } from './googleAuthentication'
import { Position } from './position'
import { Authority, JwtToken } from '../types'
import { sign } from 'jsonwebtoken'

@Entity()
export class User extends Base {
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
  address?: string

  @IsOptional()
  @IsMobilePhone('en-CA')
  @Column({ nullable: true })
  phoneNumber?: string

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
  slackTag?: string

  @OneToOne(type => GoogleAuthentication, ga => ga.user, {
    nullable: true,
    eager: true,
    cascadeAll: true
  })
  googleAuth?: GoogleAuthentication

  @OneToMany(type => Position, pos => pos.user, {
    cascadeInsert: true,
    cascadeUpdate: true,
    eager: true
  })
  positions: Position[]

  getJwtToken (secret: string) {
    const fields: JwtToken = {
      id: this.id,
      email: this.email,
      authority: this.authority
    }

    return sign(fields, process.env.API_SECRET as string)
  }
}
