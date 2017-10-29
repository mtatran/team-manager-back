import { Request, Response, NextFunction } from 'express'
import UserService from '../services/userService'
import TeamService from '../services/teamService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let userId = req.params.userId || req.body.userId || req.query.userId

  const user = await UserService.findOneById(userId, { includeAll: true })

  if (user) {
    await TeamService.populateTeamsOnUser(user)
    req.context.user = user
    return next()
  }

  return res.status(400).json({message: 'notAValidUser'})
}
