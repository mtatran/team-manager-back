import { Request, Response, NextFunction } from 'express'
import User, { Authority } from '../models/User'

export default (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  if (user.access < Authority.admin) {
    return res.status(401).json({message: 'needAdminPrivilage'})
  }

  return next()
}
