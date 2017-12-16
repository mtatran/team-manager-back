import { EntityRepository } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { Position } from '../models/position'
import { User } from '../models/user'
import { Team } from '../models/team'
import { PositionLevel } from '../types/index'

@EntityRepository(Position)
export class PositionRepository extends BaseRepository<Position> {
  async createPosition (user: User, team: Team, level: PositionLevel) {
    const existingPosition = await this.findOne({ where: {
      user: user.id,
      team: team.id
    }})

    if (existingPosition) {
      existingPosition.level = level
      return this.save(existingPosition)
    }

    const position = new Position()
    position.team = team
    position.user = user
    position.level = level

    return this.save(position)
  }
}
