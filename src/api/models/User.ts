import {Entity, Column, ManyToMany} from 'typeorm'
import Base from './Base'
import Team from './Team'

@Entity()
export default class User extends Base{
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

  @ManyToMany(type => Team)
  teams: Team[]
}
