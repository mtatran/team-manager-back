import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import GoogleService, { DriveListOptions } from '../services/googleService'
import { listResponse } from '../presentations/googlePresentation'
import UserService from '../services/userService'
import User from '../models/user'
import { OAuthBearer } from '../types'

export default class OAuthController {
  /**
   * Redirects the user to the appropriate link for authorization
   */
  static redirectToGoogle (req: Request, res: Response) {
    let authUrl = GoogleService.getAuthUrl()

    res.redirect(authUrl)
  }

  static async googleCallBack (req: Request, res: Response, next: NextFunction) {
    const {error, code} = req.query

    if ( error ) return next(Boom.boomify(error))

    const userId = req.signedCookies.userId
    if (!userId) {
      return next(Boom.unauthorized('userId cookie was not found'))
    }

    const bearer = await GoogleService.onAuthSuccess(code)
    const user: User = req.user

    user.googleAuth = bearer
    await UserService.save(user)
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
   * @apiDefine controller_google_get_files
   *
   * @apiParam {Integer} [pageSize] Maximum documents responded
   * @apiParam {string} [q] Search Query
   * @apiParam {Integer} [pageToken] Page token for requesting a certain page
   */
  static async getFiles (req: Request, res: Response, next: NextFunction) {
    const user: User = req.user
    try {
      await this.prepareUserAuthentication(user)

      const options: DriveListOptions = {
        maxResults: req.query.pageSize || 50,
        q: req.query.q,
        pageToken: req.query.pageToken
      }

      const results = await GoogleService.getListOfFiles(user.googleAuth as OAuthBearer, options)
      res.json(listResponse(results))
    } catch (e) {
      next(e)
    }
  }

  /**
   * Makes sure the user has the permissions to perform a google drive action
   * Will refresh tokens if needed and will throw an error if the user
   * has never authenticated to google before
   */
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
