import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import Base from './Base'
import Team from './Team'
import User from './User'

@Entity()
export default class Position extends Base {
  @Column()
  level: number

  @ManyToOne(type => Team, team => team.positions)
  @JoinColumn()
  team: Team

  @ManyToOne(type => User, user => user.positions)
  @JoinColumn()
  user: User
}
