import { Router } from 'express'
import OAuthController from './controllers/OAuthController'

const router = Router()

router.get('/google', OAuthController.redirectToGoogle)
router.get('/google/callback', OAuthController.googleCallBack)


export default router
