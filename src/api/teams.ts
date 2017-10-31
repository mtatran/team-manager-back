import { Router } from 'express'

// Controllers
import TeamController from '../controllers/teamController'

// Policies
import isValidTeam from '../policies/isValidTeam'
import isValidUser from '../policies/isValidUser'

const router = Router()

/**
 * @api {POST} /teams/create Create Team
 * @apiName createTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse controller_team_create
 */
router.post('/create', [], TeamController.create)

/**
 * @api {POST} /teams/:teamId/add Add User
 * @apiName addUserToTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse controller_team_add_user
 */
router.post('/:teamId/add', [isValidTeam, isValidUser], TeamController.addUser)

/**
 * @api {GET} /teams/:teamId Get Team Info
 * @apiName getTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse success_team_full
 */
router.get('/:teamId', [isValidTeam], TeamController.getTeam)

export default router
