import { JsonController, Redirect, Get, CurrentUser, Authorized, Param, BadRequestError, QueryParam } from 'routing-controllers'
import GoogleService, { DriveListOptions } from '../services/googleService'
import { listResponse } from '../presentations/googlePresentation'
import { User } from '../models/user'
import { GoogleAuthentication } from '../models/googleAuthentication'
import { OAuthBearer } from '../types'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'

interface AuthedUser extends User {
  googleAuth: GoogleAuthentication
}

@JsonController('/google')
export default class GoogleController {
  /**
   * Redirects to google OAuth2 authentication link
   *
   * @api {GET} /google/redirect Google OAuth2 Redirect
   * @apiName googleOAuth
   * @apiGroup google
   * @apiVersion  1.0.0
   */
  @Get('/redirect')
  @Redirect('useless-string') // Need to not be an empty string
  redirectToGoogle () {
    let authUrl = GoogleService.getAuthUrl()
    return authUrl
  }

  /**
   * Callback that google redirects to so that the server can get the
   * authentication token
   *
   * @api {GET} /google/callback Google OAuth2 Callback
   * @apiName googleOAuthCallback
   * @apiGroup google
   * @apiVersion  1.0.0
   */
  @Get('/callback')
  @Redirect('/connections')
  @Authorized()
  async googleCallBack (
    @CurrentUser() user: User,
    @QueryParam('error') error: string,
    @QueryParam('code') code: string
  ) {
    if ( error ) throw new BadRequestError(error)

    const bearer = await GoogleService.onAuthSuccess(code)

    if (user.googleAuth && user.googleAuth.refreshToken && !bearer.refreshToken) {
      throw new BadRequestError('Do not need to reauthenticate to google')
    }

    const googleAuth = new GoogleAuthentication()
    googleAuth.token = bearer.token
    googleAuth.refreshToken = bearer.refreshToken
    googleAuth.tokenExpireDate = bearer.tokenExpireDate

    user.googleAuth = googleAuth
    await getCustomRepository(UserRepository).save(user)
  }

  /**
   * @api {GET} /google/isAuthenticated Google OAuth2 Check
   * @apiName googleOAuthCheck
   * @apiGroup google
   * @apiVersion 1.0.0
   *
   * @apiSuccess {boolean} authenticated
  */
  @Get('/isAuthenticated')
  isAuthenticated (@CurrentUser() user: User) {
    const isAuthed = user.googleAuth !== undefined && GoogleService.isAuthenticated(user.googleAuth)
    return { authenticated: isAuthed }
  }

  /**
   * @api {GET} /google/files Get drive files
   * @apiName googleGetFiles
   * @apiGroup google
   * @apiVersion  1.0.0
   *
   * @apiUse success_google_list_response
   *
   * @apiParam {Integer} [pageSize] Maximum documents responded
   * @apiParam {string} [q] Search Query
   * @apiParam {Integer} [pageToken] Page token for requesting a certain page
   */
  @Get('/files')
  @Authorized(['google'])
  async getFiles (
    @CurrentUser({ required: true }) user: AuthedUser,
    @QueryParam('pageSize') pageSize: string = '50',
    @QueryParam('q') q: string,
    @QueryParam('pageToken') pageToken: string
  ) {
    const options: DriveListOptions = {
      pageSize: parseInt(pageSize, 10),
      q,
      pageToken
    }

    const results = await GoogleService.getListOfFiles(user.googleAuth as OAuthBearer, options)
    return listResponse(results)
  }
}
