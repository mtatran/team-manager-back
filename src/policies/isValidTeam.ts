import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import TeamService from '../services/teamService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let teamId = req.params.teamId || req.body.teamId

  const team = await TeamService.findOneById(teamId, { includeAll: true })

  if (!team) {
    next(Boom.badRequest('Team does not exist'))
  }

  req.context.team = team
  return next()
}
