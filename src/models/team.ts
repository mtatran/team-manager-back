import { Entity, Column, OneToOne, ManyToOne, OneToMany, JoinColumn } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { PositionLevel } from '../types'
import { DriveFile } from '../services/googleService'
import Base from './base'
import User from './user'
import Authentication from './authentication'

enum FilePermission {
  read = 'read',
  write = 'write'
}

export class TeamPosition {
  @Column({ enum: PositionLevel })
  level: PositionLevel

  @OneToOne(type => User, { eager: true, cascadeAll: true })
  @JoinColumn()
  user: User

  @ManyToOne(type => Team, team => team.positions)
  team: Team
}

export class File {
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

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20})
  name: string

  @OneToMany(type => TeamPosition, teamPos => teamPos.team, {
    cascadeUpdate: true,
    eager: true
  })
  positions: TeamPosition[]

  @OneToMany(type => File, file => file.team, {
    eager: true
  })
  files: File[]
}
