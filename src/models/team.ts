import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { PositionLevel, FilePermission } from '../types'
import { DriveFile } from '../services/googleService'
import Base from './base'
import User from './user'
import Position from './position'

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20})
  name: string

  @OneToMany(type => Position, pos => pos.team, {
    cascadeUpdate: true,
    cascadeInsert: true,
    eager: true
  })
  positions: Position[]

  @OneToMany(type => File, file => file.team, {
    eager: true
  })
  files: File[]
}

@Entity()
export class File extends Base {
  @Column()
  fileId: string

  @OneToOne(type => User)
  @JoinColumn()
  owner: User

  @Column('enum', { enum: FilePermission })
  permission: FilePermission

  @ManyToOne(type => Team, team => team.files)
  team: Team

  file?: DriveFile
}
