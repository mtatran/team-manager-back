import { Entity, Column, ManyToMany, JoinTable } from 'typeorm'
import Base from './Base'
import User from './User'

@Entity()
export default class Team extends Base {

  @Column()
  name: string

  @ManyToMany(type => User)
  @JoinTable()
  users: User[]
}
