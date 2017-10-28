import { ObjectID } from 'mongodb'
import * as _ from 'lodash'
import { getRepository, Repository, FindManyOptions, FindOneOptions } from 'typeorm'
import { validate, ValidationError } from 'class-validator'
import Populater, { PopulatePair, PopulateOptions, ResolveObjects } from '../utils/populater'
import Base from '../models/base'

interface QueryOptions {
  includeAll: boolean
}

export default class BaseModelService<T extends Base> {
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

  async populate (docs: Object | Object[], paths: PopulatePair[], options: Partial<PopulateOptions> = {}) {
    const populater = new Populater(docs, paths, options)
    const neededIds = _.uniqBy(populater.neededIds, (id: ObjectID) => id.toHexString())

    const results: T[] = await this.findMany({
      where: { _id: { $in: neededIds } }
    })

    /**
     * @todo: Maybe optimize this by using a hashmap
     */
    const resolveObjectArray: ResolveObjects[] = results.map(res => ({
      id: res.id,
      payload: res
    }))

    populater.resolve(resolveObjectArray, (a: ObjectID, b: ObjectID) => a.equals(b))
  }
}
