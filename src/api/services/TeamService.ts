import Team from '../models/Team'
import service from './Service'

class TeamService extends service<Team> {
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
