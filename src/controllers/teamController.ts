
import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import * as _ from 'lodash'
import TeamService from '../services/teamService'
import UserService from '../services/userService'
import GoogleService, { DriveFilePermission } from '../services/googleService'
import PositionService from '../services/positionService'
import FileService from '../services/fileService'
import * as TeamPresentation from '../presentations/teamPresentation'
import Team from '../models/team'
import File from '../models/file'
import User from '../models/user'
import { FilePermission, OAuthBearer, PositionLevel, FilePermissionAction } from '../types'

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
      await PositionService.createPosition(user, team, PositionLevel.member)
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
   * @apiParam {String} permission Can be either 'reader' or 'writer'
   *
   * @apiParamExample {JSON} Request-Example:
    {
      permission: "reader"
    }
   */
  public static async addFileToTeam (req: Request, res: Response, next: NextFunction) {
    let team: Team = req.context.team
    let user: User = req.user
    const permission: FilePermission = req.body.permission
    const fileId: string = req.context.file.id

    if (!(permission in FilePermission)) {
      return next(Boom.badRequest('Permission must be either "reader" or "writer"'))
    }

    // Transfer file to admin owner
    try {
      await GoogleService.giveEmailFilePermission(
        user.googleAuth as OAuthBearer,
        fileId,
        req.context.admin.email,
        FilePermission.owner
      )

      const file = new File()
      file.fileId = fileId
      file.owner = user
      file.permission = (permission as FilePermission)

      team.files.push(file)
      await TeamService.save(team)

      const promises = team.positions.map(pos => (
        GoogleService.giveEmailFilePermission(
          req.context.admin.googleAuth as OAuthBearer,
          fileId,
          pos.user.email,
          permission,
          { emailMessage: `A new file has been added to the Waterloop team: ${team.name}` }
        )
      ))

      await Promise.all(promises)
    } catch (e) {
      return next(e)
    }
    res.json({ message: 'done' })
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
      const userIds = team.positions.map(v => v.userId)
      const users = await UserService.findMany({ where: { id: userIds }}, { includeAll: true })

      const changes = await this.getFilePermissionChanges(users, fileId, req.context.admin.googleAuth)
      await GoogleService.saveFilePermissionActions(req.context.admin.googleAuth, changes)
    } catch (e) {
      return next(e)
    }
  }

  public static async getTeam (req: Request, res: Response, next: NextFunction) {
    const team: Team = req.context.team
    res.json(TeamPresentation.fullTeam(team))
  }

  /**
   * Permissions might need to be recalculated for each time a team changes. If the user
   * is granted permissions from another team, we don't want to accidentally overwrite
   * their permissions or send them an annoying email
   */
  private static async getFilePermissionChanges (users: User[], fileId: string, auth: OAuthBearer) {
    const driveFilePermissions = await GoogleService.getPermissionFromFile(auth, fileId)
    const drivePermissionMap: {[key: string]: DriveFilePermission} = driveFilePermissions.reduce(
      (prev, curr) => ({ ...prev, [curr.emailAddress.toLowerCase()]: curr}),
      {}
    )

    const teamIds = users.map(user => user.positions.map(pos => pos.teamId))
    const uniqueTeamIds = _.union(...teamIds)
    const teamFilePermissions = await FileService.findMany({ where: { team: uniqueTeamIds, fileId } })
    const changeActionArray: FilePermissionAction[] = []

    users.forEach(user => {
      const userTeamIds = user.positions.map(pos => pos.teamId)
      const applicablePermissions = teamFilePermissions
        .filter(file => userTeamIds.indexOf(file.teamId) >= 0)
        .map(file => file.permission)

      const currentPermission = drivePermissionMap[user.email.toLowerCase()]
      const maxGivenPermission = this.getMaxPermission(applicablePermissions)

      if (maxGivenPermission === currentPermission.role) return
      if (maxGivenPermission === FilePermission.none) {
        changeActionArray.push({ action: 'delete', permissionId: currentPermission.id, fileId })
      } else if (currentPermission.role === FilePermission.none) {
        changeActionArray.push({ action: 'create', newPermission: maxGivenPermission, email: user.email, fileId})
      } else {
        changeActionArray.push({ action: 'change', newPermission: maxGivenPermission, fileId, permissionId: currentPermission.id })
      }
    })

    return changeActionArray
  }

  private static getMaxPermission (permissions: FilePermission[]) {
    return permissions.reduce((pre, curr) => Math.max(pre, curr), FilePermission.none)
  }
}
