import Team, { TeamPosition } from '../models/team'
import User from '../models/user'
import BaseModelService from './baseModelService'
import { PositionLevel } from '../types'

class TeamService extends BaseModelService<Team> {
  constructor () {
    super(Team)
  }

  async populateTeamsOnUser (users: User | User[]) {
    await this.populate(users, [{ path: 'positions', idField: 'teamId', valueField: 'team'}])
  }

  /**
   * Add a position record to the team document
   */
  async addUserToTeam (user: User, team: Team, level: PositionLevel = PositionLevel.member) {
    // Check if user is already part of the team
    const userPositionOnTeam = team.positions.find(pos => pos.userId.equals(team.id))

    // If the position already exists, change the level and save
    if (userPositionOnTeam) {
      userPositionOnTeam.level = level
      return this.save(team)
    }

    const position = new TeamPosition()
    position.userId = user.id
    position.level = level

    team.positions.push(position)
    return this.save(team)
  }
}

export default new TeamService()
