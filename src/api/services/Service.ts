import { getRepository, Repository } from 'typeorm'
import { validate, ValidationError } from 'class-validator'

export default class Service<T> {
  private repo: Repository<T>

  constructor (model: any) {
    this.repo = getRepository(model)
  }

  async save (obj: T): Promise<Error | ValidationError | void> {
    const validationResult = await validate(obj)
    if (validationResult.length) throw validationResult

    await this.repo.save(obj)
  }

  findOneById (id: Number) {
    return this.repo.findOneById(id)
  }

  getRepo = () => this.repo
}
