import { JsonController, Redirect, Get, Post, CurrentUser, Authorized, Param, Body, BadRequestError, NotFoundError, Delete, Res, UseBefore, BodyParam, OnNull, OnUndefined } from 'routing-controllers'
import * as bcrypt from 'bcryptjs'
import * as passport from 'passport'
import * as UserPresentation from '../presentations/userPresentation'
import { User } from '../models/user'
import { Authority } from '../types'
import { Response } from 'express'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'

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
  @Post('/signup')
  async createUser (@Body() body: any) {
    const user = new User()
    user.address = body.address
    user.email = body.email
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.phoneNumber = body.phoneNumber
    user.password = await bcrypt.hash(body.password, 10)
    user.authority = Authority.member

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

    if (!user) return

    let jwt = user.getJwtToken(process.env.API_SECRET as string)
    res.cookie('authorization', jwt, { httpOnly: true })

    return null
  }

  /**
   * @api {get} /users/profile Get Self Profile
   * @apiName getProfile
   * @apiGroup Users
   * @apiVersion  1.0.0
   *
   * @apiUse success_user_full
   */
  @Get('/profile')
  async getProfile (@CurrentUser() user: User) {
    return UserPresentation.fullUser(user)
  }
}
