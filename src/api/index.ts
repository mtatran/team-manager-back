import { Router } from 'express'
import Users from './users'
import Teams from './teams'
import Auth from './auth'

const router = Router()

router.use('/users', Users)
router.use('/teams', Teams)
router.use('/auth', Auth)

export default router
