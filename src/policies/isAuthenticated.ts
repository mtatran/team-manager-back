import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    const err = Boom.unauthorized('Must be logged in')
    return next(err)
  }

  next()
}
