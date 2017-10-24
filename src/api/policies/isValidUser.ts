import { Request, Response, NextFunction } from 'express'
import UserService from '../services/UserService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let userId = req.params.userId || req.body.userId

  if (isNaN(userId)) {
    return res.status(400).json({message: 'UserId must be a number'})
  }

  userId = parseInt(userId, 10)
  const user = await UserService.findOneById(userId, { includeAll: true })

  if (user) {
    req.context.user = user
    return next()
  }

  return res.status(400).json({message: 'notAValidUser'})
}
