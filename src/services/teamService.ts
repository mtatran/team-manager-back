import Team from '../models/team'
import BaseModelService from './baseModelService'

class TeamService extends BaseModelService<Team> {
  constructor () {
    super(Team)
  }

}

export default new TeamService()
