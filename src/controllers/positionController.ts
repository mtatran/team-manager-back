import { JsonController, Param, BodyParam, NotFoundError, Delete, Post } from 'routing-controllers'
import { getCustomRepository } from 'typeorm'
import { PositionRepository } from '../repositories/positionRepository'
import { userService } from '../services/userService'
import { teamService } from '../services/teamService'
import { googleService } from '../services/googleService'
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

    let newPosition = await getCustomRepository(PositionRepository).createPosition(user, team, level)
    await googleService.userAddedToTeam(user, team)

    return newPosition
  }

  @Delete('/:positionId')
  async deletePosition (@Param('positionId') positionId: string) {
    const position = await this.getPositionById(positionId)
    await getCustomRepository(PositionRepository).remove(position)

    const user = await userService.findOneById(position.userId)
    const team = await teamService.findOneById(position.teamId)

    await googleService.userRemovedFromTeam(user, team)

    return null
  }

  private async getPositionById (positionId: string) {
    const position = await getCustomRepository(PositionRepository).findOneById(positionId)
    if (position === undefined) throw new NotFoundError('Position does not exist')
    return position
  }
}
