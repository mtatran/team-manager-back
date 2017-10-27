import { getRepository, Repository, FindManyOptions, FindOneOptions } from 'typeorm'
import { validate, ValidationError } from 'class-validator'

interface QueryOptions {
  includeAll: boolean
}

export default class BaseModelService<T> {
  joinAllDefinition = {}
  private repo: Repository<T>

  constructor (model: any) {
    this.repo = getRepository(model)
  }

  async save (obj: T): Promise<Error | ValidationError | void> {
    const validationResult = await validate(obj)
    if (validationResult.length) throw validationResult

    await this.repo.save(obj)
  }

  findOneById (id: Number, opts?: QueryOptions ) {
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
    if (!opts) return undefined

    let options: any = {}
    if (opts.includeAll) {
      options.join = this.joinAllDefinition
    }

    return options
  }

  getRepo = () => this.repo
}
