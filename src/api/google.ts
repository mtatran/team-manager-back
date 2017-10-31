import { Router } from 'express'
import GoogleController from '../controllers/googleController'

// Policies
import isAuthenticated from '../policies/isAuthenticated'
import isGoogleAuthenticated from '../policies/isGoogleAuthenticated'

const router = Router()

/**
 * @api {GET} /google/isAuthenticated Google OAuth2 Check
 * @apiName googleOAuthCheck
 * @apiGroup google
 * @apiVersion 1.0.0
 *
 * @apiSuccess {boolean} authenticated
*/
router.get('/isAuthenticated', [isAuthenticated], GoogleController.isAuthenticated)

/**
 * @api {GET} /google/redirect Google OAuth2 Redirect
 * @apiName googleOAuth
 * @apiGroup google
 * @apiVersion  1.0.0
 */
router.get('/redirect', [isAuthenticated], GoogleController.redirectToGoogle)

/**
 * @api {GET} /google/callback Google OAuth2 Callback
 * @apiName googleOAuthCallback
 * @apiGroup google
 * @apiVersion  1.0.0
 */
router.get('/callback', [isAuthenticated], GoogleController.googleCallBack)

/**
 * @api {GET} /google/files Get drive files
 * @apiName googleGetFiles
 * @apiGroup google
 * @apiVersion  1.0.0
 *
 * @apiUse controller_google_get_files
 * @apiUse success_google_list_response
 */
router.get('/files', [isAuthenticated, isGoogleAuthenticated], GoogleController.getFiles)

export default router
