
import { Request, Response, NextFunction } from 'express'
import TeamService from '../services/TeamService'
import PositionService from '../services/PositionService'
import * as TeamPresentation from '../presentations/TeamPresentation'
import Team from '../models/Team'
import User from '../models/User'
import Position from '../models/Position'

export default class UserController {
  /**
   * @apiDefine param_team_create
   *
   * @apiParam {String} name
   *
   * @apiParamExample  {JSON} Request-Example:
     {
        name: "frontend"
     }
   */
  public static create = async (req: Request, res: Response, next: NextFunction) => {
    const team = new Team()
    team.name = req.body.name

    try {
      await TeamService.save(team)
    } catch (e) {
      return next(e)
    }

    res.json({message: 'team created'})
  }

  /**
   * @apiDefine param_team_add_user
   * @apiParam {Integer} userId
   * 
   * @paramExample {JSON} Request-Example:
     {
        userId: 112
     }
   */
  public static addUser = async (req: Request, res: Response, next: NextFunction) => {
    const team: Team = req.context.team
    const user: User = req.context.user

    try {
      const positions = await team.positions
      let userInTeam = positions.findIndex(position => position.user.id == user.id) >= 0
      
      if(userInTeam) {
        return res.status(400).json({message: 'userAlreadyInTeam'})
      }
      
      const pos = new Position()
      pos.team = team
      pos.user = user
      
      await PositionService.save(pos)
      res.json({message: 'done'})
    } catch (e) {
      return next(e)
    }
  }

  public static getTeam = async (req: Request, res: Response, next: NextFunction) => {
    const team: Team = req.context.team

    const positions = team.positions

    console.log(positions)
    res.json({...team, positions})
  }
}
