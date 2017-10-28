import { Request, Response, NextFunction } from 'express'
import TeamService from '../services/teamService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let teamId = req.params.teamId || req.body.teamId

  const team = await TeamService.findOneById(teamId, { includeAll: true })

  if (team) {
    req.context.team = team
    return next()
  }

  return res.status(400).json({message: 'notAValidTeam'})
}
