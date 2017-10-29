import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import GoogleService from '../services/googleService'
import User from '../models/user'

export default async (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  const isAuthed = user.googleAuth !== undefined && GoogleService.isAuthenticated(user.googleAuth)

  if (isAuthed) return next()
  next(Boom.expectationFailed('User not authenticated to google'))
}
