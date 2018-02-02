import { Action } from 'routing-controllers'
import { Request } from 'express'
import { verify } from 'jsonwebtoken'
import { JwtToken, Authority, Roles, OAuthBearer } from '../types/index'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'
import { googleService } from '../services/googleService'

export async function authorizationChecker (action: Action, rolesArg: Roles[]) {
  const roles: Roles = rolesArg[0] || {}

  const request: Request = action.request

  const authorizationToken = request.cookies.authorization
  if (!authorizationToken) return false

  let tokenData

  try {
    tokenData = verify(authorizationToken, process.env.API_SECRET as string) as JwtToken
  } catch (e) {
    return false
  }

  action.request.userToken = tokenData

  if (roles.admin && (tokenData.authority !== Authority.admin && tokenData.authority !== Authority.superAdmin)) return false

  if (roles.google) {
    const userRepo = getCustomRepository(UserRepository)
    const user = await userRepo.findOneById(tokenData.id)
    if (!user) return false

    request.user = user

    if (!user.googleAuth) return false

    const isGoogleAuthenticated = googleService.isTokenValid(user.googleAuth)

    if (!isGoogleAuthenticated) {
      const newBearer: OAuthBearer = await googleService.reauthenticate(user.googleAuth)
      user.googleAuth.token = newBearer.token
      user.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
      await userRepo.saveWithValidation(user)
    }
  }

  return true
}
