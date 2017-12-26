import { NotFoundError } from 'routing-controllers'
import { getCustomRepository } from 'typeorm'
import { TeamRepository } from '../repositories/teamRepository'

class TeamService {
  async findOneById (id: string | number) {
    const team = await getCustomRepository(TeamRepository).findOneById(id)

    if (!team) throw new NotFoundError(`Team with id ${id} does not exist`)

    return team
  }
}

export const teamService = new TeamService()
