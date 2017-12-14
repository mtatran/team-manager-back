import { JsonController, Redirect, Get, Post, CurrentUser, Authorized, Param, Body, BadRequestError, NotFoundError, Delete, Res, UseBefore } from 'routing-controllers'
import * as passport from 'passport'
import UserService from '../services/userService'
import * as UserPresentation from '../presentations/userPresentation'
import User from '../models/user'
import { Authority } from '../types'
import { Response } from 'express'

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
    user.password = body.password
    user.authority = Authority.member

    return UserService.save(user)
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
  @UseBefore(passport.authenticate('local', { session: false }))
  async login (@CurrentUser() user: User, @Res() res: Response) {
    let jwt = UserService.createUserJwtToken(user)
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
