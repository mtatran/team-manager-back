import { JsonController, Param, BodyParam, NotFoundError, Delete, Post } from 'routing-controllers'
import { getCustomRepository } from 'typeorm'
import { PositionRepository } from '../repositories/positionRepository'
import { userService } from '../services/userService'
import { teamService } from '../services/teamService'
import { Position } from '../models/position'
import { PositionLevel } from '../types/index'

@JsonController('/positions')
export default class PositionController {
  @Post('')
  async createPosition (
    @BodyParam('userId') userId: number,
    @BodyParam('teamId') teamId: number,
    @BodyParam('level') level: PositionLevel
  ) {
    const user = await userService.findOneById(userId)
    const team = await teamService.findOneById(teamId)

    return getCustomRepository(PositionRepository).createPosition(user, team, level)
  }

  @Delete('/:positionId')
  async deletePosition (@Param('positionId') positionId: string) {
    const position = await this.getPositionById(positionId)
    await getCustomRepository(PositionRepository).remove(position)

    return null
  }

  private async getPositionById (positionId: string) {
    const position = await getCustomRepository(PositionRepository).findOneById(positionId)
    if (position === undefined) throw new NotFoundError('Position does not exist')
    return position
  }
}
