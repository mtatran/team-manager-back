import { Application } from 'express'
import * as passport from 'passport'
import User from '../models/user'
import UserService from '../services/userService'

// Strategies
import LocalStrategy from './localStrategy'
import JWTStrategy from './jwtStrategy'

passport.use(JWTStrategy)
passport.use(LocalStrategy)
passport.serializeUser((user: User, done) => done(null, user.id.toString()))
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserService.findOneById(id)
    if (user) return done(null, user)

    throw new Error('User not found')
  } catch (e) {
    done(e)
  }
})

export default (app: Application) => {
  app.use(passport.initialize())
  app.use(passport.authenticate('jwt'))
}
