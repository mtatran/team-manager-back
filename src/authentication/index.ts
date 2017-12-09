import { Application, Request, Response, NextFunction } from 'express'
import * as passport from 'passport'
import User from '../models/user'
import UserService from '../services/userService'

// Strategies
import LocalStrategy from './localStrategy'
import JWTStrategy from './jwtStrategy'

passport.use(LocalStrategy)
passport.use(JWTStrategy)

export default (app: Application) => {
  app.use(passport.initialize())

  // Custom authentication to make it optional
  app.use((req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', (err: Error, user: User, info: any) => {
      if (err) return next(err)
      if (user) req.user = user
      next()
    })(req, res, next)
  })
}
