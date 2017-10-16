import {Router} from 'express'
import Users from './users'

const router = Router()

router.use('/users', Users)

export default router
