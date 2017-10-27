import { Request, Response, NextFunction } from 'express'
import TeamService from '../services/TeamService'

export default async (req: Request, res: Response, next: NextFunction) => {
  let teamId = req.params.teamId || req.body.teamId

  if (isNaN(teamId)) {
    return res.status(400).json({message: 'TeamId must be a number'})
  }

  teamId = parseInt(teamId, 10)
  const team = await TeamService.findOneById(teamId, { includeAll: true })

  if (team) {
    req.context.team = team
    return next()
  }

  return res.status(400).json({message: 'notAValidTeam'})
}
