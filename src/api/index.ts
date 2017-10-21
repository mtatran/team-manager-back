import { Router } from 'express'
import Users from './users'
import Teams from './teams'

const router = Router()

router.use('/users', Users)
router.use('/teams', Teams)

export default router
