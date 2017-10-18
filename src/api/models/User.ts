import { Entity, Column, OneToMany } from 'typeorm'
import Base from './Base'
import Position from './Position'

@Entity()
export default class User extends Base {
  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ length: 60 })
  password: string

  @Column()
  address: string

  @Column()
  phoneNumber: string

  @Column()
  email: string

  @OneToMany(type => Position, (position: Position) => position.user)
  positions: Position[]
}
