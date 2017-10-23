import { Request, Response, NextFunction } from 'express'
import GoogleService from '../services/GoogleService'

export default class OAuthController {
  static redirectToGoogle (req: Request, res: Response) {
    let authUrl = GoogleService.getAuthUrl()
    res.redirect(authUrl)
  }

  static googleCallBack (req: Request, res: Response) {
    const {error, code} = req.query

    if( error ) {
      return res.send('Login failed')
    }

    GoogleService.onAuthSuccess(code)
    return res.send('login success')
  }
}
