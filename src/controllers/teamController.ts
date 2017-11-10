
import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import TeamService from '../services/teamService'
import UserService from '../services/userService'
import * as TeamPresentation from '../presentations/teamPresentation'
import Team, { File } from '../models/team'
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

  /**
   * @apiDefine controller_team_add_file
   *
   * @apiParam {String} teamId Should be the valid mongodb team id
   * @apiParam {String} fileId Should be the file id from google drive
   * @apiParam {String} permission Can be either 'read' or 'write'
   *
   * @apiParamExample {JSON} Request-Example:
    {
      permission: "read"
    }
   */
  public static async addFileToTeam (req: Request, res: Response, next: NextFunction) {
    let team: Team = req.context.team
    let user: User = req.user
    const permission: string = req.body.permission
    const fileId: string = req.params.fileId

    if (permission !== 'read' && permission !== 'write') {
      next(Boom.badRequest('Permission must be either "read" or "write"'))
      return
    }

    try {
      const file = new File()
      file.fileId = fileId
      file.ownerId = user.id
      file.permission = permission

      team.files.push(file)
      await TeamService.save(team)

      const userIds = team.positions.map(pos => pos.userId)
      const usersInTeam = UserService.findMany({ where: { _id: { $in: userIds } } })

      res.json(file)
      return
    } catch (e) {
      return next(e)
    }
  }

  /**
   * @apiDefine controller_team_remove_file
   *
   * @apiParam {String} teamId Should be the valid mongodb team id
   * @apiParam {String} fileId Should be the file id from google drive
   */
  public static async removeFileFromTeam (req: Request, res: Response, next: NextFunction) {
    let team: Team = req.context.team
    const fileId: string = req.params.fileId

    team.files = team.files.filter(file => file.fileId === fileId)
    try {
      await TeamService.save(team)
    } catch (e) {
      return next(e)
    }
  }

  public static async getTeam (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team
    res.json(TeamPresentation.fullTeam(team))
  }

}
