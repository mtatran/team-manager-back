import { Router } from 'express'

// Controllers
import TeamController from '../controllers/teamController'

// Policies
import isAuthenticated from '../policies/isAuthenticated'
import isGoogleAuthenticated from '../policies/isGoogleAuthenticated'
import isValidTeam from '../policies/isValidTeam'
import isValidUser from '../policies/isValidUser'
import isValidGoogleFile from '../policies/isValidGoogleFile'
import needsAdminCredentials from '../policies/needsAdminCredentials'

const router = Router()

/**
 * @api {POST} /teams/create Create Team
 * @apiName createTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse controller_team_create
 */
router.post('/create', [isAuthenticated], TeamController.create)

/**
 * @api {POST} /teams/:teamId/add Add User
 * @apiName addUserToTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse controller_team_add_user
 */
router.post('/:teamId/add', [isAuthenticated, isValidTeam, isValidUser], TeamController.addUser)

/**
 * @api {GET} /teams/:teamId Get Team Info
 * @apiName getTeam
 * @apiGroup Teams
 * @apiVersion  1.0.0
 *
 * @apiUse success_team_full
 */
router.get('/:teamId', [isValidTeam], TeamController.getTeam)

/**
 * @api {POST} /teams/:teamId/file Add file to team
 * @apiName addFileToTeam
 * @apiGroup Teams
 * @apiVersion 1.0.0
 *
 * @apiUse controller_team_add_file
 *
 * @todo: Make sure the user is also allowed to add files to the team
 */
router.post('/:teamId/file', [isAuthenticated, isGoogleAuthenticated, isValidTeam, isValidGoogleFile, needsAdminCredentials],
  TeamController.addFileToTeam)

/**
 * @api {DELETE} /teams/:teamId/file/:fileId Add file to team
 * @apiName addFileToTeam
 * @apiGroup Teams
 * @apiVersion 1.0.0
 *
 * @apiUse controller_team_remove_file
 */
router.delete('/:teamId/file/:fileId', [isAuthenticated, isGoogleAuthenticated, isValidTeam],
  TeamController.removeFileFromTeam)

export default router
