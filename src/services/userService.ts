import { hash, compare } from 'bcryptjs'
import { sign } from 'jsonwebtoken'

import User, { UserPosition } from '../models/user'
import Team from '../models/team'
import BaseModelService from './base/modelService'
import { JwtToken, PositionLevel } from '../types'

class UserService extends BaseModelService<User> {
  constructor () {
    super(User)
  }

  /**
   * Create a user object, use at first instead of save so that
   * it can hash the password
   */
  async create (user: User) {
    /**
     * @todo: Add password strength checker here
     */
    user.password = await hash(user.password, 10)
    return super.save(user)
  }

  /**
   * Trys to find a user given the login credentials
   */
  async findByLogin ( email: string, password: string ) {
    const user = await this.getRepo().findOne({ where: { email }})
    if (!user) return null

    const passwordMatch = await compare(password, user.password)
    if (!passwordMatch) return null

    return user
  }

  /**
   * Create a JWT based on user information
   */
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

  /**
   * Add a position record to the user document referencing the team and position
   */
  async addTeamToUser (team: Team, user: User, level: PositionLevel = PositionLevel.member) {
    // Check if user is already part of the team
    const teamPositionOnUser = user.positions.find(pos => pos.teamId.equals(team.id))

    // If the position already exists, change the level and save
    if (teamPositionOnUser) {
      teamPositionOnUser.level = level
      return this.save(user)
    }

    const position = new UserPosition()
    position.teamId = team.id
    position.level = level

    user.positions.push(position)
    return this.save(user)
  }
}

export default new UserService()
