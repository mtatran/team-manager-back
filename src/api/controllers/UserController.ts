
import { Request, Response, NextFunction } from 'express'
import UserService from '../services/UserService'
import * as UserPresentation from '../presentations/UserPresentation'
import User from '../models/User'

export default class UserController {
  public static create = async (req: Request, res: Response, next: NextFunction) => {
    const user = new User()
    user.address = req.body.address
    user.email = req.body.email
    user.firstName = req.body.firstName
    user.lastName = req.body.lastName
    user.phoneNumber = req.body.phoneNumber
    user.password = req.body.password

    try {
      await UserService.save(user)
    } catch (e) {
      return next(e)
    }

    res.json({message: 'user created'})
  }

  public static login = (req: Request, res: Response) => {
    const user = req.user
    let jwt = UserService.createUserJwtToken(user)

    res.json({token: jwt})
  }

  public static getProfile = (req: Request, res: Response) => {
    const presented = UserPresentation.presentUserFull(req.user)
    res.json(presented)
  }
}
