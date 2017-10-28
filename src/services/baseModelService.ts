import { ObjectID } from 'mongodb'
import { getRepository, Repository, FindManyOptions, FindOneOptions } from 'typeorm'
import { validate, ValidationError } from 'class-validator'

interface QueryOptions {
  includeAll: boolean
}

export default class BaseModelService<T> {
  private repo: Repository<T>

  constructor (model: any) {
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

    if (id instanceof ObjectID) {
      documentID = id
    } else {
      documentID = new ObjectID(id as string)
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
}
