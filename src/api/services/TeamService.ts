import Team from '../models/Team'
import BaseModelService from './BaseModelService'

class TeamService extends BaseModelService<Team> {
  constructor () {
    super(Team)
  }

  joinAllDefinition = {
    alias: "team",
    leftJoinAndSelect: {
      positions: "team.positions",
      user: "positions.user"
    }
  }

}

export default new TeamService()
