import { Request, Response, NextFunction } from 'express'
import User from '../models/user'
import GoogleService from '../services/googleService'
import { OAuthBearer } from '../types'

export default async (req: Request, res: Response, next: NextFunction) => {
  const fileId: string = req.body.fileId
  const user: User = req.user

  try {
    const file = await GoogleService.getFile(user.googleAuth as OAuthBearer, fileId)
    req.context.file = file
    next()
  } catch (e) {
    next(e)
  }
}
