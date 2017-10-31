import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import TeamService from '../services/teamService'

export default async (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return next(Boom.unauthorized('Must be logged in'))
  }
  try {
    await TeamService.populateTeamsOnUser(req.user)
  } catch (e) {
    return next(e)
  }
  next()
}
