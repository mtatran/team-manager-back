import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'
import UserService from '../services/userService'

const fromCookie = (field: string) => (request: Request) => {
  let jwt = request.cookies[field]

  return jwt || null
}

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    fromCookie('authorization'),
    ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    ExtractJwt.fromBodyField('Authorization'),
    ExtractJwt.fromUrlQueryParameter('Authorization')
  ]),
  secretOrKey: process.env.API_SECRET as string
}

export default new Strategy(options, async (jwt, done) => {
  try {
    const user = await UserService.findOneById(jwt.id, { includeAll: true })

    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }

  } catch (e) {
    done(e)
  }
})
