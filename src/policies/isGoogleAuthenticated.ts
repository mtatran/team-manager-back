import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import User from '../models/user'
import GoogleService from '../services/googleService'
import UserService from '../services/userService'
import { OAuthBearer } from '../types'

export default async (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  if (user.googleAuth === undefined) {
    next(Boom.preconditionRequired('You must log into Google first', { type: 'Google'}))
    return
  }

  try {
    const isAuthenticationValid = GoogleService.isAuthenticated(user.googleAuth)

    if (!isAuthenticationValid) {
      const newBearer: OAuthBearer = await GoogleService.reauthenticate(user.googleAuth)
      user.googleAuth.token = newBearer.token
      user.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
      await UserService.save(user)
    }

    next()
  } catch (e) {
    next(e)
  }
}
