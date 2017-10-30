import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import { Authority } from '../types'
import * as Boom from 'boom'

export default (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  if (user.authority !== Authority.admin) {
    return next(Boom.unauthorized('Need admin privilage'))
  }

  return next()
}
