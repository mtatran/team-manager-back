import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import GoogleService from '../services/googleService'
import User from '../models/user'

export default async (req: Request, res: Response, next: NextFunction) => {
  const user: User = req.user

  const isAuthed = user.googleAuth !== undefined

  if (isAuthed) return next()
  next(Boom.preconditionRequired('You must log into Google first', { type: 'Google'}))
}
