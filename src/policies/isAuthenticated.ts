import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next(Boom.unauthorized('Must be logged in'))
  }

  next()
}
