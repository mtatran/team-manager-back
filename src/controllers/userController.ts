import { JsonController, Get, Post, Body, Res, BodyParam, OnUndefined } from 'routing-controllers'
import * as bcrypt from 'bcryptjs'
import { User } from '../models/user'
import { Authority, PositionLevel } from '../types'
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
  @Post('')
  async createUser (@Body() body: any) {
    const user = new User()
    user.address = body.address
    user.email = body.email
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.phoneNumber = body.phoneNumber
    user.password = await bcrypt.hash(body.password, 10)
    user.authority = Authority.member

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
   * @apiName getUsers
   * @apiGroup Users
   * @apiVersion 1.0.0
   */
  @Get('')
  async getUsers () {
    const userRepo = getCustomRepository(UserRepository)
    return userRepo.findAllUsersWithTeam()
  }

  @Get('/preview')
  async getUsersPreview () {
    const userRepo = getCustomRepository(UserRepository)

    return userRepo.find({
      select: ['id', 'firstName', 'lastName', 'email', 'slackTag']
    })
  }
}
