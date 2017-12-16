import { Action } from 'routing-controllers'
import { Request } from 'express'
import { verify } from 'jsonwebtoken'
import { JwtToken, Authority } from '../types/index'

export function authorizationChecker (action: Action, roles: string[]) {
  const authorizationToken = (action.request as Request).cookies.auth
  if (!authorizationToken) return false

  let tokenData

  try {
    tokenData = verify(authorizationToken, process.env.API_SECRET as string) as JwtToken
  } catch (e) {
    return false
  }

  action.request.userToken = tokenData
  return tokenData.authority === Authority.admin

}
