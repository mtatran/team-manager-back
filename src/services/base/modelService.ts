import { getRepository, Repository, FindManyOptions, FindOneOptions } from 'typeorm'
import { validate, ValidationError } from 'class-validator'
import Base from '../../models/base'
import PopulateService from './populateService'

interface QueryOptions {
  includeAll: boolean
}

export default class BaseModelService<T extends Base> extends PopulateService<Base, number> {
  private repo: Repository<T>

  constructor (model: any) {
    super()
    this.repo = getRepository(model)
  }

  /**
   * Saves the given document but validates it first
   */
  async save (obj: T[] | T): Promise<Error | ValidationError | void> {
    const validationResult = await validate(obj)
    if (validationResult.length) throw validationResult

    /**
     * This has to be done because the save method in typeorm is defined with
     * overloaded signatures instead of T | T[]. Typescript must think we're calling
     * two different methods here
     */
    if (Array.isArray(obj)) {
      await this.repo.save(obj)
    } else {
      await this.repo.save(obj)
    }
  }

  findOneById (id: number | string, opts?: QueryOptions ) {
    return this.repo.findOneById(id, this.parseOpts(opts))
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
    let options: any = {}

    return { ...options, ...this._parseOpts(opts) }
  }

  getRepo = () => this.repo

  protected _parseOpts (opts?: QueryOptions): Object | undefined { return {} }
  /**
   *  The following methods are implemented for the populateService base class
   */
  protected findNeededObjects (ids: number[], idField: string = '_id'): Promise<Base[]> {
    return this.findMany({
      where: { [idField]: ids }
    })
  }
  protected objectToId (obj: Base) { return obj.id }
  protected idToString (id: number) { return id.toString() }
}
