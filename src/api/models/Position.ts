import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm'
import Base from './Base'
import Team from './Team'
import User from './User'

export enum PositionLevel {
  member,
  coLead,
  lead
}

@Entity()
export default class Position extends Base {
  @Column('enum', { enum: PositionLevel })
  level: PositionLevel = PositionLevel.member

  @ManyToOne(type => Team, team => team.positions)
  @JoinColumn()
  team: Team

  @ManyToOne(type => User, user => user.positions)
  @JoinColumn()
  user: User
}
