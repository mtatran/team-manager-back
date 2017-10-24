import { Router } from 'express'

// Controllers
import TeamController from './controllers/TeamController'

// Policies
import isValidTeam from './policies/isValidTeam'
import isValidUser from './policies/isValidUser'

const router = Router()

/**
 * @api {POST} /teams/create Create Team
 * @apiName createTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse param_team_create
 *
 * @apiUse success_team_full
 */
router.post('/create', [], TeamController.create)

/**
 *
 * @api {POST} /teams/:teamId/add Add user
 * @apiName addUserToTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiParam  {Integer} teamId
 *
 * @apiUse param_team_add_user
 *
 */
router.post('/:teamId/add', [isValidTeam, isValidUser], TeamController.addUser)

router.get('/:teamId', [isValidTeam], TeamController.getTeam)

export default router
