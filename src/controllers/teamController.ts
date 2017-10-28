
import { Request, Response, NextFunction } from 'express'
import TeamService from '../services/teamService'
import UserService from '../services/userService'
import Team, { TeamPosition } from '../models/team'
import User, { UserPosition } from '../models/user'

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
  public static async create (req: Request, res: Response, next: NextFunction) {
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
  public static async addUser (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team
    const user: User = req.context.user

    try {
      const positions = team.positions
      let userInTeam = positions.findIndex(position => position.user.id === user.id) >= 0
      if (userInTeam) {
        return res.status(400).json({message: 'userAlreadyInTeam'})
      }

      await UserService.addTeamToUser(team, user)

      res.json({message: 'done'})
    } catch (e) {
      return next(e)
    }
  }

  public static async getTeam (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team

    const positions = team.positions

    console.log(positions)
    res.json({...team, positions})
  }
}
