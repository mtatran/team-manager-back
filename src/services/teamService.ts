import Team from '../models/team'
import User from '../models/user'
import BaseModelService from './base/modelService'

class TeamService extends BaseModelService<Team> {

  joinAllDefinition = {
    alias: 'team',
    leftJoinAndSelect: {
      positions: 'team.positions',
      user: 'positions.user',
      files: 'team.files'
    }
  }

  constructor () {
    super(Team)
  }

  async populateTeamsOnUser (users: User | User[]) {
    await this.populate(users, [{ path: 'positions', idField: 'teamId', valueField: 'team'}])
  }
}

export default new TeamService()
