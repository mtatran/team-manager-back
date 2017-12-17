import { EntityRepository, getConnection } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { User } from '../models/user'
import { compare } from 'bcryptjs'
import { Authority } from '../types/index'

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> {
  async findByLogin (email: string, password: string) {
    const user = await this.findOne({ where: { email }})
    if (!user) return null

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) return null

    return user
  }

  async findAllUsersWithTeam () {
    return this.find({
      join: {
        alias: 'user',
        leftJoinAndSelect: {
          'positions': 'user.positions',
          'team': 'positions.team'
        }
      }
    })
  }

  async getAdminUser () {
    const admin = await this.findOne({
      where: { authority: Authority.admin },
      cache: { milliseconds: 6000000, id: 'admin_user'}
    })

    if (!admin) throw new Error('No admin user exists')
    return admin
  }

  removeAdminFromCache () {
    const queryResultCache = getConnection().queryResultCache
    if (queryResultCache) queryResultCache.remove(['admin_user'])
  }

}
