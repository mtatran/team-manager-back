import { Strategy, ExtractJwt } from 'passport-jwt'
import UserService from '../services/UserService'

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    ExtractJwt.fromBodyField('Authorization'),
    ExtractJwt.fromUrlQueryParameter('Authorization')
  ]),
  secretOrKey: process.env.API_SECRET as string
}

export default new Strategy(options, async (jwt, done) => {
  try {
    const user = UserService.findOneById(jwt.id)
    return done(null, user)
  } catch (e) {
    done(e)
  }
})
