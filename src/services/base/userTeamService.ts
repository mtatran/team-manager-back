import { User } from '../../models/user'
import { Team } from '../../models/team'

export abstract class UserTeamService {
  teamCreated (team: Team) { return }
  userCreated (user: User) { return }

  teamDeleted (team: Team) { return }
  userDeleted (user: User) { return }

  userAddedToTeam (user: User, team: Team) { return }
  userRemovedFromTeam (user: User, team: Team) { return }
}
