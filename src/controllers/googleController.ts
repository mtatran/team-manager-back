import { Request, Response } from 'express'
import * as Boom from 'boom'
import GoogleService, { DriveListOptions } from '../services/googleService'
import UserService from '../services/userService'
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

    /**
     * @todo should redirect page to a react page
     */
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
  static async getFiles (req: Request, res: Response) {
    const user: User = req.user
    await this.prepareUserAuthentication(user)

    const options: DriveListOptions = {
      maxResults: req.query.pageSize || 50,
      q: req.query.q,
      pageToken: req.query.pageToken
    }

    const results = await GoogleService.getListOfFiles(user.googleAuth, options)
  }

  private static async prepareUserAuthentication (user: User): Promise<void> {
    if (user.googleAuth === undefined) {
      throw Boom.preconditionRequired('You must log into Google first', { type: 'Google'})
    }

    if (GoogleService.isAuthenticated(user.googleAuth)) return

    const newBearer = await GoogleService.reauthenticate(user.googleAuth)
    user.googleAuth = newBearer
    await UserService.save(user)
  }
}
