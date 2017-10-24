import Team from '../models/Team'
import BaseModelService from './BaseModelService'

class TeamService extends BaseModelService<Team> {
  joinAllDefinition = {
    alias: 'team',
    leftJoinAndSelect: {
      positions: 'team.positions',
      user: 'positions.user'
    }
  }

  constructor () {
    super(Team)
  }

}

export default new TeamService()
