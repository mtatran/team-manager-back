import { EntityRepository } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { File } from '../models/file'
import { Team } from '../models/team'

@EntityRepository(File)
export class FileRepository extends BaseRepository<File> {
  findOneByTeam (fileId: string, team: Team) {
    return this.findOne({
      where: {
        fileId,
        teamId: team.id
      }
    })
  }
}
