import { Team } from '../models/team'
import { teamPosition } from './positionPresentation'

/**
 * @api {OBJECT} PartialTeam PartialTeam
 * @apiGroup Custom types
 * @apiVersion 1.0.0
 * @apiSuccess {String} id
 * @apiSuccess {String} name
 */
export const partialTeam = (team: Team) => ({
  id: team.id,
  name: team.name
})

/**
 * @apiDefine success_team_full
 *
 * @apiSuccess {Integer} id
 * @apiSuccess {String} name
 * @apiSuccess {[TeamPosition](#api-Custom_types-ObjectTeamposition)[]} positions
 */
export const fullTeam = (team: Team) => ({
  id: team.id,
  name: team.name,
  positions: team.positions.map(teamPosition)
})
