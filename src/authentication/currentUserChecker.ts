import { Request } from 'express'
import { Action } from 'routing-controllers'
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../types/index'
import { userService } from '../services/userService'

export function currentUserChecker (action: Action) {
  const request: Request = action.request

  // If the request user already exists, return that
  if (request.user) return request.user

  try {
    let tokenData: JwtToken

    // Check to see if token data has already been parsed (probably)
    if (request.tokenData) {
      tokenData = request.tokenData
    } else {
      const token = request.cookies.authorization
      tokenData = verify(token, process.env.API_SECRET as string) as JwtToken
      request.tokenData = tokenData
    }

    if (!tokenData) return null

    const userId = tokenData.id
    return userService.findOneById(userId)
  } catch (e) {
    return null
  }
}
