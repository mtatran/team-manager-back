import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

import User from '../models/User'
import BaseModelService from './BaseModelService'
import { user as userConfig } from '../config'
import { JwtToken } from '../types'

class UserService extends BaseModelService<User> {
  joinAllDefinition = {
    alias: 'user',
    leftJoinAndSelect: {
      positions: 'user.positions',
      team: 'positions.team'
    }
  }

  constructor () {
    super(User)
  }

  async save (user: User) {
    /**
     * @todo: Add password strength checker here
     */
    user.password = await hash(user.password, userConfig.hashCount)
    return super.save(user)
  }

  async findByLogin ( email: string, password: string ) {
    const user = await this.getRepo().findOne({ where: { email }})
    if (!user) throw new Error('emailNotFound')

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) throw new Error('incorrectPassword')

    return user
  }

  createUserJwtToken (user: User) {
    const jwtFields: JwtToken = {
      id: user.id,
      email: user.email,
      authority: user.authority
    }
    /**
     * @todo: decide on how long these tokens should last
     */
    return sign(jwtFields, process.env.API_SECRET as string)
  }
}

export default new UserService()
