import { User } from '../../models/user'
import { Team } from '../../models/team'

export abstract class UserTeamService {
  teamCreated (team: Team) { return }
  userCreated (user: User) { return }

  beforeTeamDelete (team: Team) { return }
  afterTeamDelete (team: Team) { return }

  beforeUserDelete (user: User) { return }
  afterUserDelete (user: User) { return }

  userAddedToTeam (user: User, team: Team) { return }
  userRemovedFromTeam (user: User, team: Team) { return }
}
