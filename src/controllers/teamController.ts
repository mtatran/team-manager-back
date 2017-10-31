
import { Request, Response, NextFunction } from 'express'
import TeamService from '../services/teamService'
import UserService from '../services/userService'
import * as TeamPresentation from '../presentations/teamPresentation'
import Team from '../models/team'
import User from '../models/user'

export default class UserController {
  /**
   * @apiDefine controller_team_create
   *
   * @apiParam {String} name
   *
   * @apiParamExample  {JSON} Request-Example:
     {
        name: "frontend"
     }
   *
   * @apiSuccess {String} message "Team created"
   *
   * @apiSuccessExample {json} Success-Response:
     {
      message: "team created"
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
   * @apiDefine controller_team_add_user
   * @apiParam {Integer} userId
   *
   * @paramExample {JSON} Request-Example:
     {
        userId: 112
     }
   *
   * @success {String} message "done"
   *
   * @apiSuccessExample {JSON} Success-Response:
    {
      message: "done"
    }
   *
   */
  public static async addUser (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team
    const user: User = req.context.user

    try {
      await UserService.addTeamToUser(team, user)
      await TeamService.addUserToTeam(user, team)

      res.json({message: 'done'})
    } catch (e) {
      return next(e)
    }
  }

  public static async getTeam (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team
    res.json(TeamPresentation.fullTeam(team))
  }
}
