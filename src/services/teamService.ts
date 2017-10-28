import { ObjectID } from 'mongodb'
import Team from '../models/team'
import User from '../models/user'
import BaseModelService from './baseModelService'

class TeamService extends BaseModelService<Team> {
  constructor () {
    super(Team)
  }

  async populateTeamsOnUser (user: User | User []) {
    let teamIds: ObjectID[] = []

    if (Array.isArray(user)) {
      user.forEach(usr => usr.positions.forEach(pos => teamIds.push(pos.id)))
    } else {
      teamIds = user.positions.map(pos => pos.id)
    }

    const teamObjects = await this.findMany({ where: {
      id: { $in: teamIds }
    }})

    let teamObjectsHashMap: {[key: string]: Team} = {}

    teamObjects.forEach(team => {
      teamObjectsHashMap = {
        ...teamObjectsHashMap,
        [team.id.toString()]: team
      }
    })

    if (Array.isArray(user)) {
      user.forEach(usr => this.addTeamObjectToUser(usr, teamObjectsHashMap))
    } else {
      this.addTeamObjectToUser(user, teamObjectsHashMap)
    }
  }
  private addTeamObjectToUser (user: User, teamMap: {[key: string]: Team}) {
    user.positions.forEach(pos => {
      let team = teamMap[pos.teamId.toString()]
      if (!team) throw new Error(`Team id ${pos.id.toString()} does not exist`)

      pos.team = team
    })
  }

}

export default new TeamService()
