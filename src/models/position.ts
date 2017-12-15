import { Entity, Column, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { User } from './user'
import { Team } from './team'
import { Base } from './base'
import { PositionLevel } from '../types'

@Entity()
export class Position extends Base {
  @Column('enum', { enum: PositionLevel })
  level: PositionLevel

  @RelationId((position: Position) => position.team)
  teamId: number

  @ManyToOne(type => Team, team => team.positions)
  @JoinColumn()
  team: Team

  @RelationId((position: Position) => position.user)
  userId: number

  @ManyToOne(type => User, user => user.positions)
  @JoinColumn()
  user: User
}
