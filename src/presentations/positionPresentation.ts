import { Position } from '../models/position'
import { partialTeam } from './teamPresentation'
import { partialUser } from './userPresentation'

/**
 * @api {OBJECT} TeamPosition TeamPosition
 * @apiGroup Custom types
 * @apiVersion 1.0.0
 * @apiSuccess {Enum} level "member", "coLead", "lead"
 * @apiSuccess {String} userId
 * @apiSuccess {[PartialUser](#api-Custom_types-ObjectPartialuser)} PartialUser
 */
export const teamPosition = (position: Position) => ({
  level: position.level,
  user: position.user && partialUser(position.user)
})

/**
 * @api {OBJECT} UserPosition UserPosition
 * @apiGroup Custom types
 * @apiVersion 1.0.0
 * @apiSuccess {Enum} level "member", "coLead", "lead"
 * @apiSuccess {String} userId
 * @apiSuccess {[PartialTeam](#api-Custom_types-ObjectPartialteam)} team
 */
export const userPosition = (position: Position) => ({
  level: position.level,
  team: position.team && partialTeam(position.team)
})
