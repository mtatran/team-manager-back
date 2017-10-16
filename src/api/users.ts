import {Router} from 'express'
import {getConnection} from 'typeorm'
import User from './models/User'

const router = Router()

router.get('/create', async (req, res, next) => {
  try {

    const connection = await getConnection()
    
    const user = new User()
    user.firstName = 'Tyler'
    user.lastName = 'Zhang'
    user.password = 'awfljdskkfs'
    
    await connection.manager.save(user)
  } catch(e) {
    console.error(e)
  }

  res.json({message: 'done'})
})

export default router
