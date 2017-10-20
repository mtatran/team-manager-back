import Team from '../models/Team'
import service from './Service'

class TeamService extends service<Team> {
  constructor() {
    super(Team)
  }
}

export default new TeamService()
