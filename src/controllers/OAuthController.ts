import { Request, Response } from 'express'
import GoogleService from '../services/googleService'

export default class OAuthController {
  static redirectToGoogle (req: Request, res: Response) {
    let authUrl = GoogleService.getAuthUrl()
    res.redirect(authUrl)
  }

  static async googleCallBack (req: Request, res: Response) {
    const {error, code} = req.query

    if ( error ) {
      return res.send('Login failed')
    }

    await GoogleService.onAuthSuccess(code)

    return res.send('login success')
  }
}
