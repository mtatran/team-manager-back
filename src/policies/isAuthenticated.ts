import { Request, Response, NextFunction } from 'express'

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    const err = new Error('mustBeAuthenticated')
    return next(err)
  }

  next()
}
