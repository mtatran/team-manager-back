import { Request, Response } from 'express'
import GoogleService from '../services/googleService'
import User from '../models/user'

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

  static isAuthenticated (req: Request, res: Response) {
    const user: User = req.user
    const isAuthed = user.googleAuth !== undefined && GoogleService.isAuthenticated(user.googleAuth)

    res.json({ authenticated: isAuthed })
  }

  /**
   * @apiDefine param_google_files
   *
   * @apiParam {Integer} [pageSize] Maximum documents responded
   * @apiParam {string} [q] Search Query
   * @apiParam {Integer} [pageToken] Page token for requesting a certain page
   */
  static getFiles (req: Request, res: Response) {

  }
}
