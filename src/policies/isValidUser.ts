import { Request, Response, NextFunction } from 'express'
import UserService from '../services/userService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let userId = req.params.userId || req.body.userId

  const user = await UserService.findOneById(userId, { includeAll: true })

  if (user) {
    req.context.user = user
    return next()
  }

  return res.status(400).json({message: 'notAValidUser'})
}
