
import { JsonController, Get, Post, CurrentUser, Param, BodyParam, BadRequestError, Delete } from 'routing-controllers'
import * as _ from 'lodash'
import { AdminUser } from './parameter-decorators'
import GoogleService, { DriveFilePermission } from '../services/googleService'
import { Team } from '../models/team'
import { File } from '../models/file'
import { User } from '../models/user'
import { FilePermission, OAuthBearer, PositionLevel, FilePermissionAction } from '../types'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'
import { TeamRepository } from '../repositories/teamRepository'
import { PositionRepository } from '../repositories/positionRepository'
import { FileRepository } from '../repositories/fileRepository'
import { teamService } from '../services/teamService'
import { userService } from '../services/userService'
import { Position } from '../models/position'

@JsonController('/teams')
export default class UserController {
/**
  * @api {POST} /teams/create Create Team
  * @apiName createTeam
  * @apiGroup Teams
  * @apiVersion  1.0.0
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
  @Post('/create')
  async create ( @BodyParam('name', { required: true }) name: string) {
    const team = new Team()
    team.name = name

    await getCustomRepository(TeamRepository).save(team)
    return null
  }

  /**
   * @api {GET} /teams Get all teams
   * @apiName getAllTeams
   * @apiGroup Teams
   * @apiVersion 1.0.0
   */
  @Get('')
  async getAllTeams () {
    return getCustomRepository(TeamRepository).findAllWithUsers()
  }

  @Get('/all/preview')
  async getAllTeamsPreview () {
    const teamRepo = getCustomRepository(TeamRepository)

    return teamRepo.find({
      select: ['id', 'name']
    })
  }

  /**
   * @api {GET} /teams/:teamId Get Team Info
   * @apiName getTeam
   * @apiGroup Teams
   * @apiVersion  1.0.0
   *
   * @apiUse success_team_full
   */
  @Get('/:teamId')
  async getTeam (@Param('teamId') teamId: string) {
    return teamService.findOneById(teamId)
  }

  /**
   * @api {POST} /teams/:teamId/add Add User
   * @apiName addUserToTeam
   * @apiGroup Teams
   * @apiVersion  1.0.0
   *
   * @apiParam {Integer} teamId
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
  @Post('/:teamId/users')
  async addUserToTeam (
    @Param('teamId') teamId: string,
    @BodyParam('userId') userId: number,
    @BodyParam('level') level: PositionLevel
  ) {
    const team: Team = await teamService.findOneById(teamId)
    const user: User = await userService.findOneById(userId)

    const position = new Position()
    position.user = user
    position.team = team
    position.level = level || PositionLevel.member

    await getCustomRepository(PositionRepository).saveWithValidation(position)
    return null
  }

  /**
   * @api {DELETE} /teams/:teamId/add Remove User
   * @apiName removeUserFromTeam
   * @apiGroup Teams
   * @apiVersion  1.0.0
   *
   * @apiParam {Integer} userId
   * @ApiParam {Integer} teamId
   */
  @Delete('/:teamId/users/:userId')
  async removeUserFromTeam (
    @Param('teamId') teamId: string,
    @Param('userId') userId: string
  ) {
    const team: Team = await teamService.findOneById(teamId)
    const user: User = await userService.findOneById(userId)

    const newPositions = team.positions.filter(position => position.id !== user.id)
    team.positions = newPositions

    await getCustomRepository(PositionRepository).save(newPositions)
    return null
  }

  /**
   * @api {POST} /teams/:teamId/file Add file to team
   * @apiName addFileToTeam
   * @apiGroup Teams
   * @apiVersion 1.0.0
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
  @Post('/:teamId/file')
  async addFileToTeam (
    @CurrentUser() admin: User,
    @AdminUser() user: User,
    @Param('teamId') teamId: string,
    @BodyParam('permission') permission: string,
    @BodyParam('fileId') fileId: string
  ) {
    const team: Team = await teamService.findOneById(teamId)

    if (!(permission in FilePermission)) {
      throw new BadRequestError('Permission must be reader or writer')
    }

    // Transfer file to admin owner
    await GoogleService.giveEmailFilePermission(
        user.googleAuth as OAuthBearer,
        fileId,
        admin.email,
        FilePermission.owner
      )

    const file = new File()
    file.fileId = fileId
    file.owner = user
    file.permission = FilePermission[permission]
    file.team = team

    await getCustomRepository(FileRepository).save(file)

    const promises = team.positions.map(pos => (
        GoogleService.giveEmailFilePermission(
          admin.googleAuth as OAuthBearer,
          fileId,
          pos.user.email,
          FilePermission[permission],
          { emailMessage: `A new file has been added to the Waterloop team: ${team.name}` }
        )
      ))

    await Promise.all(promises)
    return null
  }

  /**
   * @api {DELETE} /teams/:teamId/file/:fileId Add file to team
   * @apiName addFileToTeam
   * @apiGroup Teams
   * @apiVersion 1.0.0
   *
   * @apiParam {String} teamId Should be the valid mongodb team id
   * @apiParam {String} fileId Should be the file id from google drive
   */
  @Delete('/:teamId/file/:fileId')
  async removeFileFromTeam (
    @AdminUser() admin: User,
    @Param('teamId') teamId: string,
    @Param('fileId') fileId: string
  ) {
    const team = await teamService.findOneById(teamId)
    team.files = team.files.filter(file => file.fileId === fileId)

    await getCustomRepository(TeamRepository).save(team)
    const userIds = team.positions.map(v => v.userId)
    const users = await getCustomRepository(UserRepository).find({ where: { id: userIds }})

    const googleAuth = admin.googleAuth as OAuthBearer

    const changes = await this.getFilePermissionChanges(users, fileId, googleAuth)
    await GoogleService.saveFilePermissionActions(googleAuth, changes)
  }

  /**
   * Permissions might need to be recalculated for each time a team changes. If the user
   * is granted permissions from another team, we don't want to accidentally overwrite
   * their permissions or send them an annoying email
   */
  private async getFilePermissionChanges (users: User[], fileId: string, auth: OAuthBearer) {
    const driveFilePermissions = await GoogleService.getPermissionFromFile(auth, fileId)
    const drivePermissionMap: {[key: string]: DriveFilePermission} = driveFilePermissions.reduce(
      (prev, curr) => ({ ...prev, [curr.emailAddress.toLowerCase()]: curr}),
      {}
    )

    const teamIds = users.map(user => user.positions.map(pos => pos.teamId))
    const uniqueTeamIds = _.union(...teamIds)
    const teamFilePermissions = await getCustomRepository(FileRepository).find({ where: { team: uniqueTeamIds, fileId } })
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

  private getMaxPermission (permissions: FilePermission[]) {
    return permissions.reduce((pre, curr) => Math.max(pre, curr), FilePermission.none)
  }
}
