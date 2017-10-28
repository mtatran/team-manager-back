import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import { Authority } from '../types'

export default (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  if (user.authority < Authority.admin) {
    return res.status(401).json({message: 'needAdminPrivilage'})
  }

  return next()
}
