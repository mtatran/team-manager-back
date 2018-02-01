import { JsonController, Redirect, Get, CurrentUser, Authorized, BadRequestError, QueryParam } from 'routing-controllers'
import { googleService } from '../services/googleService'
import { User } from '../models/user'
import { GoogleAuthentication } from '../models/googleAuthentication'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'
import { AdminUser } from './parameter-decorators/index'

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
    let authUrl = googleService.getAuthUrl()
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

    const bearer = await googleService.onAuthSuccess(code)

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
    const isAuthed = user.googleAuth !== undefined && googleService.isTokenValid(user.googleAuth)
    return { authenticated: isAuthed }
  }

  @Get('/token')
  @Authorized({ google: true })
  async getAccountToken (
    @CurrentUser() user: AuthedUser
  ) {
    return { token: user.googleAuth.token }
  }

  @Get('/token/admin')
  @Authorized({ admin: true })
  async getAdminAccountToken (
    @AdminUser({ required: true }) admin: AuthedUser
  ) {
    return { token: admin.googleAuth.token }
  }
}
