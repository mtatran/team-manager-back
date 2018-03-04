import { Repository } from 'typeorm'
import { ValidatorOptions, validate, ValidationError } from 'class-validator'
import { Base } from '../models/base'

export class BaseRepository<T extends Base> extends Repository<T> {
  async saveWithValidation (objs: T[], opts?: ValidatorOptions): Promise<T[]>
  async saveWithValidation (obj: T, opts?: ValidatorOptions): Promise<T>
  async saveWithValidation (objs: T[] | T, opts?: ValidatorOptions) {
    if (Array.isArray(objs)) {
      let validationPromises = objs.map(obj => validate(obj, opts))
      const possibleErrors = await Promise.all(validationPromises)
      const errors: ValidationError[] = ([] as any).concat(...possibleErrors)

      if (errors.length) throw errors
      return this.save(objs as any)
    } else {
      let errors = await validate(objs, opts)
      if (errors.length) throw errors
      return this.save(objs as any)
    }
  }
}
