
import { JsonController, Get, Post, CurrentUser, Param, BodyParam, BadRequestError, Delete, QueryParams, Authorized, InternalServerError, MethodNotAllowedError } from 'routing-controllers'
import * as _ from 'lodash'
import { AdminUser } from './parameter-decorators'
import { log } from '../utils/log'
import { googleService } from '../services/googleService'
import { Team } from '../models/team'
import { File } from '../models/file'
import { User } from '../models/user'
import { FilePermission, OAuthBearer, PositionLevel, ApiFindQuery } from '../types'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'
import { TeamRepository } from '../repositories/teamRepository'
import { FileRepository } from '../repositories/fileRepository'
import { teamService } from '../services/teamService'
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
  @Post()
  @Authorized({ admin: true })
  async create (
    @BodyParam('name', { required: true }) name: string,
    @BodyParam('users') users: string[] |null
  ) {
    const team = new Team()
    team.name = name

    if (users) {
      const initialUsers = await getCustomRepository(UserRepository)
        .findByIds(users)

      team.positions = initialUsers.map(user => {
        const pos = new Position()
        pos.user = user
        pos.level = PositionLevel.member
        return pos
      })
    }

    await getCustomRepository(TeamRepository).save(team)
    return null
  }

  /**
   * @api {GET} /teams Get all teams
   * @apiName findAllTeams
   * @apiGroup Teams
   * @apiVersion 1.0.0
   */
  @Get()
  async findAllTeams (@QueryParams() params: ApiFindQuery<Team>) {
    const teamRepo = getCustomRepository(TeamRepository)

    let query = teamRepo.createQueryBuilder('team')

    if (params.q) {
      query = query.where('team.name LIKE CONCAT("%", :q, "%")', { q: params.q })
    }

    if (params.order) {
      query = query.orderBy(`team.${params.order}`, params.orderDir || 'ASC')
    }

    const pageSize = parseInt(params.pageSize as any, 10) || 50
    const page = parseInt(params.page as any, 10) || 0

    const [data, total] = await query
      .addOrderBy('team.id', 'ASC')
      .limit(pageSize)
      .offset(pageSize * page)
      .leftJoinAndSelect('team.positions', 'position')
      .leftJoin('position.user', 'user')
      .addSelect([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.authority'
      ])
      .getManyAndCount()

    return { data, total }
  }

  @Get('/all/preview')
  async getAllTeamsPreview () {
    const teamRepo = getCustomRepository(TeamRepository)

    return teamRepo.find({
      select: ['id', 'name']
    })
  }

  @Get('/:teamId/test')
  async test (
    @Param('teamId') teamId: string
  ) {
    const team = await teamService.findOneByIdWithUsers(teamId)
    await googleService.beforeTeamDelete(team)
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
   * @api {POST} /teams/:teamId/files Add file to team
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
  @Post('/:teamId/files')
  @Authorized({ google: true })
  async addFileToTeam (
    @CurrentUser() user: User,
    @AdminUser() admin: User,
    @Param('teamId') teamId: string,
    @BodyParam('permission', { required: true }) permission: string,
    @BodyParam('fileId', { required: true }) fileId: string
  ) {
    const team: Team = await teamService.findOneByIdWithUsers(teamId)

    if (!(permission in FilePermission)) {
      throw new BadRequestError('Permission must be reader or writer')
    }

    // Transfer file to admin owner
    try {
      await googleService.giveEmailFilePermission(
        user.googleAuth as OAuthBearer,
        fileId,
        admin.email,
        FilePermission.owner
      )
    } catch (e) {
      log.error(e)
      throw new InternalServerError(e.message)
    }

    const file = new File()
    file.fileId = fileId
    file.owner = user
    file.permission = FilePermission[permission]
    file.team = team

    await getCustomRepository(FileRepository).save(file)

    const promises = team.positions.map(pos => (
        googleService.giveEmailFilePermission(
          admin.googleAuth as OAuthBearer,
          fileId,
          pos.user.email,
          FilePermission[permission],
          { emailMessage: `A new file has been added to the Waterloop team: ${team.name}` }
        )
    ))

    try {
      await Promise.all(promises)
    } catch (e) {
      log.error(e)
      throw new InternalServerError(e.message)
    }
    return null
  }

  /**
   * @api {DELETE} /teams/:teamId/files/:fileId Add file to team
   * @apiName addFileToTeam
   * @apiGroup Teams
   * @apiVersion 1.0.0
   *
   * @apiParam {String} teamId Should be the valid mongodb team id
   * @apiParam {String} fileId Should be the file id from google drive
   */
  @Delete('/:teamId/files/:fileId')
  async removeFileFromTeam (
    @AdminUser() admin: User,
    @Param('teamId') teamId: string,
    @Param('fileId') fileId: string
  ) {
    throw new MethodNotAllowedError('This route is not implemented yet')
    // const team = await teamService.findOneById(teamId)
    // team.files = team.files.filter(file => file.fileId === fileId)

    // await getCustomRepository(TeamRepository).save(team)
    // const userIds = team.positions.map(v => v.userId)
    // const users = await getCustomRepository(UserRepository).find({ where: { id: userIds }})
  }
}
