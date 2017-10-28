import { Router } from 'express'
import * as passport from 'passport'

// Controllers
import UserController from '../controllers/userController'

// Policies
import isAuthenticated from '../policies/isAuthenticated'

const router = Router()

/**
 * @api {POST} /users/login Login
 * @apiName login
 * @apiGroup Users
 * @apiVersion  1.0.0
 *
 * @apiUse param_user_login
 *
 * @apiSuccess (200) {String} token JWT for authentication
 *
 * @apiSuccessExample {JSON} Success-Response:
   {
       token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e..."
   }
 */
router.post('/login', passport.authenticate('local'), UserController.login)

/**
 * @api {POST} /users/signup Signup
 * @apiName signup
 * @apiGroup Users
 * @apiVersion  1.0.0
 *
 * @apiUse param_user_signup
 *
 * @apiSuccess (200) {String} message
 * @apiSuccessExample {JSON} Success-Response:
   {
       message : "user created"
   }
 *
 */
router.post('/signup', UserController.signup)

/**
 * @api {get} /users/profile Get Self Profile
 * @apiName getProfile
 * @apiGroup Users
 * @apiVersion  1.0.0
 *
 * @apiUse success_user_full
 */
router.get('/profile', [isAuthenticated], UserController.getProfile)

export default router
