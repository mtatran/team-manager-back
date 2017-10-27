import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import { PositionLevel } from '../../types'
import Base from './Base'
import Team from './Team'
import User from './User'

@Entity()
export default class Position extends Base {
  @Column('enum', { enum: PositionLevel, default: PositionLevel.member })
  level: PositionLevel

  @ManyToOne(type => Team, team => team.positions)
  @JoinColumn()
  team: Team

  @ManyToOne(type => User, user => user.positions, { eager: true })
  @JoinColumn()
  user: User
}
