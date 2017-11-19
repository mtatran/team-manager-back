import { getConnection } from 'typeorm'
import { File } from '../models/team'
import { FilePermission } from '../types'

export interface RawFile {
  id: number,
  createDate: Date,
  updateDate: Date,
  fileId: string,
  permission: FilePermission,
  ownerId: number,
  authenticationId: number,
  teamId: number
}

export default class RawDatabase {
  static async getRawFileRecordsByFileId (fileId: string) {
    const result = await getConnection()
      .getRepository(File)
      .createQueryBuilder('file')
      .where('file.fileId = :id', { fileId })
      .getRawMany()

    return result as RawFile[]
  }
}
