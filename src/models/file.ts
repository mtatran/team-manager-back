import { Entity, Column, OneToOne, ManyToOne, JoinColumn, RelationId } from 'typeorm'
import { FilePermission } from '../types'
import { DriveFile } from '../services/googleService'
import { Base } from './base'
import { User } from './user'
import { Team } from './team'

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

  @RelationId((file: File) => file.team)
  teamId: number

  file?: DriveFile
}
