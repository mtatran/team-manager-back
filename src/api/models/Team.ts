import { Entity, Column, OneToMany, JoinTable } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import Base from './Base'
import Position from './Position'

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column()
  name: string

  @OneToMany(type => Position, (position: Position) => position.team)
  @JoinTable()
  positions: Position[]
}
