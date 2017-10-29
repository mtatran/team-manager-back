import { Router } from 'express'
import Users from './users'
import Teams from './teams'
import Google from './google'

const router = Router()

router.use('/users', Users)
router.use('/teams', Teams)
router.use('/google', Google)

export default router
