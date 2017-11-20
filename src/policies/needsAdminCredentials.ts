import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import UserService from '../services/userService'
import TeamService from '../services/teamService'
import GoogleService from '../services/googleService'
import { Authority, OAuthBearer } from '../types'

export default async (req: Request, res: Response, next: NextFunction) => {
  let userId = req.params.userId || req.body.userId || req.query.userId

  const user = await UserService.findOne({ where: { authority: Authority.superAdmin }})

  if (!user) {
    return next(Boom.badRequest('There is currently no super admin account'))
  }

  if (!user.googleAuth) {
    return next(Boom.badImplementation('The admin user is not authenticated with google'))
  }

  try {
    const isAuthenticationValid = GoogleService.isAuthenticated(user.googleAuth)

    if (!isAuthenticationValid) {
      const newBearer: OAuthBearer = await GoogleService.reauthenticate(user.googleAuth)
      user.googleAuth.token = newBearer.token
      user.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
      await UserService.save(user)
    }
  } catch (e) {
    next(e)
  }

  req.context.admin = user
  return next()
}
