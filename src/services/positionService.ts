import Position from '../models/position'
import Team from '../models/team'
import User from '../models/user'
import BaseModelService from './base/modelService'
import { PositionLevel } from '../types'

class PositionService extends BaseModelService<Position> {
  joinAllDefinition = {
    alias: 'position',
    leftJoinAndSelect: {
      user: 'position.user',
      team: 'positions.team'
    }
  }

  constructor () {
    super(Position)
  }

  async createPosition (user: User, team: Team, level: PositionLevel) {
    const existingPosition = await this.findOne({ where: { user: user.id, team: team.id }})
    if (existingPosition) { // Position exists so we'll just update it
      existingPosition.level = level
      await this.save(existingPosition)
    } else {
      const pos = new Position()
      pos.team = team
      pos.user = user
      pos.level = level

      await this.save(pos)
    }
  }
}

export default new PositionService()
