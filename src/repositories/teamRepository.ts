import { EntityRepository } from 'typeorm'
import { BaseRepository } from './baseRepository'
import { Team } from '../models/team'

@EntityRepository(Team)
export class TeamRepository extends BaseRepository<Team> {
  findAllWithUsers () {
    return this.find({
      join: {
        alias: 'team',
        leftJoinAndSelect: {
          'positions': 'team.positions',
          'user': 'positions.user'
        }
      }
    })
  }

  findOneByIdWithUsers (id: number | string) {
    return this.findOneById(id, {
      join: {
        alias: 'team',
        leftJoinAndSelect: {
          'positions': 'team.positions',
          'user': 'positions.user'
        }
      }
    })
  }
}
