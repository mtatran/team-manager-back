import * as passportJWT from 'passport-jwt'
import UserService from '../services/userService'

const ExtractJwt = passportJWT.ExtractJwt
const Strategy = passportJWT.Strategy

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    ExtractJwt.fromBodyField('Authorization'),
    ExtractJwt.fromUrlQueryParameter('Authorization')
  ]),
  secretOrKey: process.env.API_SECRET as string
}

export default new Strategy(options, async (jwt, done) => {
  try {
    const user = await UserService.findOneById(jwt.id)

    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
    }

  } catch (e) {
    done(e)
  }
})
