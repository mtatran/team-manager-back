import { Request, Response, NextFunction } from 'express'
import * as Boom from 'boom'
import GoogleService, { DriveListOptions } from '../services/googleService'
import { listResponse } from '../presentations/googlePresentation'
import UserService from '../services/userService'
import User, { GoogleAuthentication } from '../models/user'
import { OAuthBearer, OAuthBearerWithRefresh } from '../types'

interface AuthedUser extends User {
  googleAuth: GoogleAuthentication
}

class GoogleController {
  /**
   * Redirects the user to the appropriate link for authorization
   */
  redirectToGoogle = (req: Request, res: Response) => {
    let authUrl = GoogleService.getAuthUrl()

    res.redirect(authUrl)
  }

  googleCallBack = async (req: Request, res: Response, next: NextFunction) => {
    const user: User = req.user
    const {error, code} = req.query

    if ( error ) return next(Boom.boomify(error))

    const bearer = await GoogleService.onAuthSuccess(code)

    if (user.googleAuth && user.googleAuth.refreshToken && !bearer.refreshToken) {
      return next(Boom.conflict('Do not need to reauthenticate to google'))
    }

    user.googleAuth = bearer as OAuthBearerWithRefresh
    await UserService.save(user)
    /**
     * @todo should redirect page to a react page
     */
    return res.send('login success')
  }

  isAuthenticated = (req: Request, res: Response) => {
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
  getFiles = async (req: Request, res: Response, next: NextFunction) => {
    const user: AuthedUser = req.user
    try {
      await this.prepareUserAuthentication(user)

      const options: DriveListOptions = {
        pageSize: req.query.pageSize || 50,
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
  private async prepareUserAuthentication (user: AuthedUser): Promise<void> {
    if (GoogleService.isAuthenticated(user.googleAuth)) return

    const newBearer: OAuthBearerWithRefresh = await GoogleService.reauthenticate(user.googleAuth)

    user.googleAuth.token = newBearer.token
    user.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
    await UserService.save(user)
  }
}

export default new GoogleController()
