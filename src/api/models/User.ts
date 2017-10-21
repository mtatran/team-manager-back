import { Entity, Column, OneToMany } from 'typeorm'
import { IsAlpha, Length, IsMobilePhone, IsEmail, IsOptional } from 'class-validator'
import Base from './Base'
import Position from './Position'

export enum Access {
  member,
  admin
}

@Entity()
export default class User extends Base {
  @IsAlpha({message: 'You can only have letters in your name'})
  @Column()
  firstName: string

  @IsAlpha({message: 'You can only have letters in your name'})
  @Column()
  lastName: string

  @Length(60, 60)
  @Column({ length: 60 })
  password: string

  @IsOptional()
  @Column()
  address: string

  @IsOptional()
  @IsMobilePhone('en-CA')
  @Column()
  phoneNumber: string

  @IsEmail()
  @Column()
  email: string

  @Column('enum', { enum: Access })
  access: Access

  @OneToMany(type => Position, (position: Position) => position.user)
  positions: Promise<Position[]>

}
