
import { Request, Response, NextFunction } from 'express'
import UserService from '../services/userService'
import * as UserPresentation from '../presentations/userPresentation'
import User from '../models/user'

export default class UserController {
  /**
   * @apiDefine controller_user_signup
   *
   * @apiParam {String} [address]
   * @apiParam {String} email
   * @apiParam {String} firstName
   * @apiParam {String} lastName
   * @apiParam {String} [phoneNumber]
   * @apiParam {String} password
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
  public static async signup (req: Request, res: Response, next: NextFunction) {
    const user = new User()
    user.address = req.body.address
    user.email = req.body.email
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.phoneNumber = req.body.phoneNumber
    user.password = req.body.password

    try {
      await UserService.create(user)
    } catch (e) {
      return next(e)
    }

    res.json({message: 'user created'})
  }

  /**
   * @apiDefine controller_user_login
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
  public static async login (req: Request, res: Response) {
    const user = req.user
    let jwt = UserService.createUserJwtToken(user)

    res.cookie('authorization', jwt, { httpOnly: true }).end()
  }

  public static async getProfile (req: Request, res: Response) {
    const presented = UserPresentation.fullUser(req.user)
    res.json(presented)
  }
}
