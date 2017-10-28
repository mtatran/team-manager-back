import { Entity, Column, OneToOne, JoinTable, ObjectID, ObjectIdColumn } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { PositionLevel } from '../types'
import Base from './base'
import User from './user'

export class TeamPosition extends Base {
  @Column({ enum: PositionLevel })
  level: PositionLevel

  @OneToOne(type => User, { eager: true })
  user: User
}

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20})
  name: string

  @Column(type => TeamPosition)
  positions: TeamPosition[]
}
