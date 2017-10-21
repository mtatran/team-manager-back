import { Strategy } from 'passport-local'
import UserService from '../services/UserService'

const options = {
  usernameField: 'email',
  passwordField: 'password'
}

const callback = async (email: string, password: string, done: Function) => {
  try {
    const user = await UserService.findByLogin(email, password)
    return done(null, user)
  } catch (e) {
    if (e.message === 'emailNotFound') {
      return done(null, false, { message: 'Email not found' })
    } else if (e.message === 'incorrectPassword') {
      return done(null, false, { message: 'Incorrect password' })
    }
    done(e)
  }
}

export default new Strategy(options, callback)
