import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { PositionLevel, FilePermission } from '../types'
import { DriveFile } from '../services/googleService'
import Base from './base'
import User from './user'
import Authentication from './authentication'

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20})
  name: string

  @OneToMany(type => TeamPosition, teamPos => teamPos.team, {
    cascadeUpdate: true,
    cascadeInsert: true,
    eager: true
  })
  positions: TeamPosition[]

  @OneToMany(type => File, file => file.team, {
    eager: true
  })
  files: File[]
}

@Entity()
export class TeamPosition extends Base {
  @Column('enum', { enum: PositionLevel })
  level: PositionLevel

  @OneToOne(type => User, { cascadeAll: true })
  @JoinColumn()
  user: User

  @ManyToOne(type => Team, team => team.positions)
  team: Team
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

  @OneToOne(type => Authentication, { eager: true })
  @JoinColumn()
  authentication: Authentication

  @ManyToOne(type => Team, team => team.files)
  team: Team

  file?: DriveFile
}
