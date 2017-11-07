import { ObjectId } from 'mongodb'
import { getRepository, Repository, FindManyOptions, FindOneOptions, ObjectID } from 'typeorm'
import { validate, ValidationError } from 'class-validator'
import Base from '../../models/base'
import PopulateService from './populateService'

interface QueryOptions {
  includeAll: boolean
}

export default class BaseModelService<T extends Base> extends PopulateService<Base, ObjectID> {
  private repo: Repository<T>

  constructor (model: any) {
    super()
    this.repo = getRepository(model)
  }

  /**
   * Saves the given document but validates it first
   */
  async save (obj: T): Promise<Error | ValidationError | void> {
    const validationResult = await validate(obj)
    if (validationResult.length) throw validationResult

    await this.repo.save(obj)
  }

  findOneById (id: ObjectID | string, opts?: QueryOptions ) {
    let documentID

    if (typeof id === 'string') {
      documentID = new ObjectId(id as string)
    } else {
      documentID = id
    }

    return this.repo.findOneById(documentID, this.parseOpts(opts))
  }

  findMany (query: FindManyOptions<T>, opts?: QueryOptions) {
    const q: any = {
      ...this.parseOpts(opts),
      ...query
    }
    return this.repo.find(q)
  }

  findOne (query: FindOneOptions<T>, opts?: QueryOptions) {
    const q: any = {
      ...this.parseOpts(opts),
      ...query
    }
    return this.repo.findOne(q)
  }

  parseOpts (opts?: QueryOptions): Object | undefined {
    if (!opts) return undefined

    let options: any = {}
    return options
  }

  getRepo = () => this.repo

  /**
   *  The following methods are implemented for the populateService base class
   */
  protected findNeededObjects (ids: ObjectID[], idField: string = '_id'): Promise<Base[]> {
    return this.findMany({
      where: { [idField]: { $in: ids } }
    })
  }
  protected objectToId (obj: Base) { return obj.id }
  protected idToString (id: ObjectID) { return id.toHexString() }
}
