import { Entity, Column, ObjectID } from 'typeorm'
import { IsAlphanumeric } from 'class-validator'
import { PositionLevel } from '../types'
import { DriveFile } from '../services/googleService'
import Base from './base'
import User from './user'

type FilePermission = 'read' | 'write'

export class TeamPosition {
  @Column({ enum: PositionLevel })
  level: PositionLevel

  @Column()
  userId: ObjectID

  user?: User
}

export class File {
  @Column()
  fileId: string

  @Column()
  ownerId: ObjectID

  @Column()
  permission: FilePermission

  file?: DriveFile
}

@Entity()
export default class Team extends Base {
  @IsAlphanumeric()
  @Column({ unique: true, length: 20})
  name: string

  @Column(type => TeamPosition)
  positions: TeamPosition[] = []

  @Column(type => File)
  files: File[] = []
}
