import { Strategy, ExtractJwt } from 'passport-jwt'
import UserService from '../services/UserService'
import { auth as authConfig} from '../../config'

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('jwt'),
    ExtractJwt.fromBodyField('Authorization'),
    ExtractJwt.fromUrlQueryParameter('Authorization')
  ]),
  secretOrKey: authConfig.secret
}

export default new Strategy(options, async (jwt, done) => {
  try {
    const user = UserService.findOneById(jwt.id)
    return done(null, user)
  } catch (e) {
    done(e)
  }
})
