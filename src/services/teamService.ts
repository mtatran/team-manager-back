import { ObjectID } from 'mongodb'
import Team from '../models/team'
import User from '../models/user'
import BaseModelService from './baseModelService'

class TeamService extends BaseModelService<Team> {
  constructor () {
    super(Team)
  }

  async populateTeamsOnUser (users: User | User[]) {
    await this.populate(users, [{ path: 'positions', idField: 'teamId', valueField: 'team'}])
  }

}

export default new TeamService()
