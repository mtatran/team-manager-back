import { Request } from 'express'
import { Action } from 'routing-controllers'
import { verify } from 'jsonwebtoken'
import { getCustomRepository } from 'typeorm'
import { JwtToken, Authority } from '../types/index'
import { UserRepository } from '../repositories/userRepository'

export function currentUserChecker (action: Action) {
  const request: Request = action.request

  try {
    let tokenData: JwtToken

    if (request.tokenData) {
      tokenData = request.tokenData
    } else {
      const token = (action.request as Request).cookies.authorization
      tokenData = verify(token, process.env.API_SECRET as string) as JwtToken
      request.tokenData = tokenData
    }

    if (!tokenData) return null

    const userId = tokenData.id
    return getCustomRepository(UserRepository).findOneById(userId)
  } catch (e) {
    return null
  }

}
