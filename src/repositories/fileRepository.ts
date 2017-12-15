import { EntityRepository } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { File } from '../models/file'
import { User } from '../models/user'
import { Team } from '../models/team'

@EntityRepository(File)
export class FileRepository extends BaseRepository<File> {

}
