import { JsonController, Get, Post, Body, Res, BodyParam, OnUndefined, Authorized, CurrentUser, QueryParams } from 'routing-controllers'
import * as bcrypt from 'bcryptjs'
import { User } from '../models/user'
import { Authority, PositionLevel, ApiFindQuery } from '../types'
import { Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'
import { TeamRepository } from '../repositories/teamRepository'
import { Position } from '../models/position'

@JsonController('/users')
export default class UserController {
  /**
   * @api {POST} /users/login Login
   * @apiName login
   * @apiGroup Users
   * @apiVersion  1.0.0
   *
   * @apiParam {String} [address]
   * @apiParam {String} email
   * @apiParam {String} firstName
   * @apiParam {String} lastName
   * @apiParam {String} [phoneNumber]
   * @apiParam {String} password
   * @apiParam {String} authority
   *
   * @apiParamExample  {JSON} Request-Example:
     {
        address: "111 waterloo st",
        email: "me@tylerzhang.com",
        firstName: "tyler",
        lastName: "zhang",
        phoneNumber: "123-456-789",
        password: "password"
     }
   */
  @Authorized({ admin: true })
  @Post()
  async createUser (@Body() body: any) {
    const user = new User()
    user.address = body.address
    user.email = body.email
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.phoneNumber = body.phoneNumber
    user.password = await bcrypt.hash(body.password, 10)
    user.authority = body.authority || Authority.member

    if (body.teams) {
      const teams = await getCustomRepository(TeamRepository).findByIds(body.teams)
      user.positions = teams.map(team => {
        const pos = new Position()
        pos.level = PositionLevel.member
        pos.team = team

        return pos
      })
    }

    return getCustomRepository(UserRepository).save(user)
  }

  /**
   * @api {POST} /users/login Login
   * @apiName login
   * @apiGroup Users
   * @apiVersion  1.0.0
   *
   * @apiParam {String} email
   * @apiParam {String} password
   *
   * @apiParamExample {JSON} Request-Example:
    {
      email: "me@tylerzhang.com",
      password: "password"
    }
   */
  @Post('/login')
  @OnUndefined(401)
  async login (
    @BodyParam('email') email: string,
    @BodyParam('password') password: string,
    @Res() res: Response) {
    const userRepo = getCustomRepository(UserRepository)
    const user = await userRepo.findByLogin(email, password)

    if (!user) return undefined

    let jwt = user.getJwtToken(process.env.API_SECRET as string)
    res.cookie('authorization', jwt, { httpOnly: true })

    return null
  }

  /**
   * @api {get} /users Get User Profile
   * @apiName findAllUsers
   * @apiGroup Users
   * @apiVersion 1.0.0
   */
  @Get()
  async findAllUsers (
    @QueryParams() params: ApiFindQuery<User>
  ) {
    const userRepo = getCustomRepository(UserRepository)

    let query = userRepo.createQueryBuilder('user')
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.address',
        'user.phoneNumber',
        'user.email',
        'user.authority',
        'user.createDate',
        'user.updateDate'
      ])

    if (params.q) {
      query = query.where('CONCAT(user.firstName, " ", user.lastName) LIKE CONCAT("%", :q, "%")', { q: params.q })
      query = query.orWhere('user.phoneNumber LIKE CONCAT("%", :q, "%")', { q: params.q })
      query = query.orWhere('user.email LIKE CONCAT("%", :q, "%")', { q: params.q })
      query = query.orWhere('user.authority LIKE CONCAT("%", :q, "%")', { q: params.q })
      query = query.orWhere('user.slackTag LIKE CONCAT("%", :q, "%")', { q: params.q })
    }

    if (params.order) {
      query = query.orderBy(`user.${params.order}`, params.orderDir || 'ASC')
    }

    const pageSize = parseInt(params.pageSize as any, 10) || 50
    const page = parseInt(params.page as any, 10) || 0

    const [data, total] = await query
      .addOrderBy('user.id', 'ASC')
      .limit(pageSize)
      .offset(pageSize * page)
      .leftJoinAndSelect('user.positions', 'position')
      .leftJoinAndSelect('position.team', 'team')
      .getManyAndCount()

    return { data, total }
  }

  @Get('/all/preview')
  async getUsersPreview () {
    const userRepo = getCustomRepository(UserRepository)

    return userRepo.find({
      select: ['id', 'firstName', 'lastName', 'email', 'slackTag']
    })
  }

  @Get('/me/info')
  @Authorized()
  async getUserInfo (@CurrentUser() user: User) {
    const info = {
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      phoneNumber: user.phoneNumber,
      email: user.email,
      authority: user.authority,
      slackTag: user.slackTag,
      googleAuth: !!user.googleAuth
    }

    return info
  }
}
