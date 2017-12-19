import { EntityRepository } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { File } from '../models/file'

@EntityRepository(File)
export class FileRepository extends BaseRepository<File> {

}
