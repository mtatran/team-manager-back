import { Entity, Column, OneToMany } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { Base } from './base'
import { File } from './file'
import { Position } from './position'

@Entity()
export class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20 })
  name: string

  @OneToMany(type => Position, pos => pos.team, {
    cascadeUpdate: true,
    cascadeInsert: true,
    eager: true
  })
  positions: Position[]

  @OneToMany(type => File, file => file.team, {
    eager: true,
    cascadeInsert: true,
    cascadeUpdate: true
  })
  files: File[]
}
