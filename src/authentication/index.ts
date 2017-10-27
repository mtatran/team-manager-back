import { Application } from 'express'
import * as passport from 'passport'
import User from '../models/User'
import UserService from '../services/UserService'

// Strategies
import LocalStrategy from './LocalStrategy'
import JWTStrategy from './JwtStrategy'

passport.use(LocalStrategy)
passport.use(JWTStrategy)
passport.serializeUser((user: User, done) => done(null, user.id))
passport.deserializeUser(async (id: number, done) => {
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
  app.use(passport.session())
}
