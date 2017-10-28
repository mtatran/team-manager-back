import Team from '../models/team'
import BaseModelService from './baseModelService'

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
