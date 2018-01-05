import { User } from '../../models/user'
import { Team } from '../../models/team'

export abstract class UserTeamService {
  abstract teamCreated (team: Team)
  abstract userCreated (user: User)

  abstract teamDeleted (team: Team)
  abstract userDeleted (user: User)

  abstract userAddedToTeam (user: User, team: Team)
  abstract userRemovedFromTeam (user: User, team: Team)
}
