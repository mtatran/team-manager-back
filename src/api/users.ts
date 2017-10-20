import { Router } from 'express'
import * as passport from 'passport'

// Controllers
import UserController from './controllers/UserController'

// Policies
import isAuthenticated from './policies/isAuthenticated'

const router = Router()

router.post('/login', passport.authenticate('local'), UserController.login)
router.post('/signup', UserController.create)
router.get('/profile', [isAuthenticated], UserController.getProfile)

export default router
