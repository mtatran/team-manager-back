/**
 * This file is for implementing a service to interact with google drive's api
 *
 * Resources for additional information:
 * https://developers.google.com/drive/v2/reference/files#resource
 */
import * as assert from 'assert'
import * as _ from 'lodash'
import {
  OAuthBearer,
  FilePermission,
  FilePermissionAction,
  permissionToNumber,
  numberToPermission } from '../../types'
import {
  AddPermissionOptions,
  DriveFilePermission
} from './types'
export * from './types'
import { UserTeamService } from '../base/userTeamService'
import DriveClient from './driveClient'
import { Team } from '../../models/team'
import { User } from '../../models/user'
import { getCustomRepository, getRepository } from 'typeorm'
import { UserRepository } from '../../repositories/userRepository'

class GoogleService extends UserTeamService {
  /**
   * Generates the URL that users should be redirected to the initiate
   * the OAuth2 process
   */
  getAuthUrl (): string {
    return DriveClient.getAuthUrl('https://www.googleapis.com/auth/drive')
  }

  /**
   * When authentication is successful and a code is obtained
   */
  async onAuthSuccess (code: string): Promise<OAuthBearer> {
    return DriveClient.getAuthTokenFromCode(code)
  }

  /**
   * Check to see if the auth object is currently authenticated
   */
  isTokenValid (auth: OAuthBearer): boolean {
    return 'token' in auth && auth.tokenExpireDate.getTime() > Date.now()
  }

  /**
   * Use the OAuthBearer data and create a new one by reauthenticating
   */
  async reauthenticate (auth: OAuthBearer): Promise<OAuthBearer> {
    return DriveClient.getAuthTokenFromCode(auth.refreshToken, true)
  }

  /**
   * Refresh user oauth token
   */
  async refreshUserOAuthToken (user: User, saveToServer = true): Promise<User> {
    if (!user.googleAuth) throw new Error('User must be already authenticated to google')

    const newToken = await this.reauthenticate(user.googleAuth)
    user.googleAuth.token = newToken.token
    user.googleAuth.tokenExpireDate = newToken.tokenExpireDate

    if (saveToServer) await getCustomRepository(UserRepository).save(user)

    return user
  }

  /**
   * Adds email with permission to file. If successful, returns the permission id
   */
  async giveEmailFilePermission (
    auth: OAuthBearer,
    fileId: string,
    email: string,
    permission: FilePermission,
    options: Partial<AddPermissionOptions> = {}
  ): Promise<string> {
    const data = await new DriveClient(auth)
        .addFilePermission(fileId, email, permission, options)

    return (data as any).id
  }

  /**
   * Removes permission from a file
   */
  async removePermissionFromFile (auth: OAuthBearer, fileId: string, permissionId: string) {
    return new DriveClient(auth)
      .removeFilePermision(fileId, permissionId)
  }

  /**
   * Returns currently granted permissions for the drive file
   */
  async getPermissionFromFile (auth: OAuthBearer, fileId: string): Promise<DriveFilePermission[]> {
    const data = await new DriveClient(auth).getFilePermission(fileId)
    return data.permissions as any
  }

  /**
   * Changes the permission of the file
   */
  async updatePermissionForFile (auth: OAuthBearer, fileId: string, permissionId: string, permission: FilePermission) {
    return new DriveClient(auth)
      .updateFilePermission(fileId, permissionId, permission)
  }

  /**
   * Executes actions given by the actions array. Will batch add/delete/update permissions
   */
  async saveFilePermissionActions (actions: FilePermissionAction[]) {
    const auth = await this.getAdminOAuth()
    let permissionPromises = actions.map(action => {
      if (action.action === 'create') {
        return this.giveEmailFilePermission(auth, action.fileId, action.email, action.newPermission)
      } else if (action.action === 'delete') {
        return this.removePermissionFromFile(auth, action.fileId, action.permissionId)
      } else if (action.action === 'change') {
        return this.updatePermissionForFile(auth, action.fileId, action.permissionId, action.newPermission)
      } else return Promise.resolve()
    })

    return Promise.all(permissionPromises as any)
  }

  /**
   * Ran before the team is deleted. This will reassess all permissions for all users and all files
   * in the the team
   */
  async beforeTeamDelete (team: Team) {
    const users = team.positions.map(pos => pos.user)
    let permissionChangeArray: FilePermissionAction[] = []

    team.files.forEach(async file => {
      const permissionChanges = await this.getFilePermissionChanges(users, file.fileId, team.id)
      permissionChangeArray.concat(permissionChanges)
    })

    return this.saveFilePermissionActions(permissionChangeArray)
  }

  userAddedToTeam (user: User, team: Team) {
    return this.userStatusWithTeamChanged(user, team)
  }

  userRemovedFromTeam (user: User, team: Team) {
    return this.userStatusWithTeamChanged(user, team)
  }
  /**
   * Sees if there should be any permission changes for all the files
   * contained in team for user
   */
  async userStatusWithTeamChanged (user: User, team: Team) {
    // We get all permission changes for each file in team
    let permissionChangeArray: FilePermissionAction[] = []

    const promises = team.files.map(async file => {
      const permissionChanges = await this.getFilePermissionChanges([ user ], file.fileId)
      permissionChangeArray.push(...permissionChanges)
    })
    await Promise.all(promises)
    return this.saveFilePermissionActions(permissionChangeArray)
  }

  /**
   * Returns the admin OAUTH token. Need to have this for authenticated actions
   */
  private async getAdminOAuth (): Promise<OAuthBearer> {
    let admin = await getCustomRepository(UserRepository).getSuperAdminUser()
    assert(admin, 'Super admin currently does not exist')
    assert(admin.googleAuth, 'Super admin is not authenticated to google')

    if (!this.isTokenValid(admin.googleAuth as OAuthBearer)) {
      admin = await this.refreshUserOAuthToken(admin)
    }

    return admin.googleAuth as OAuthBearer
  }

  /**
   * returns a hashmap of all the permissions granted to user array for file fileId
   * Also has the option of excluding a team by id which is used for before delete
   */
  private async getUsersPermissionsForFile (user: User[], fileId: string, excludeTeamId?: number) {
    let query: any = getRepository(User).createQueryBuilder('user')
      .select('user.id')
      .whereInIds(user.map(v => v.id))
      .leftJoin('user.positions', 'positions')

    if (excludeTeamId) {
      query = query.leftJoin('positions.team', 'team', 'team.id != :teamId', { teamId: excludeTeamId })
    } else {
      query = query.leftJoin('positions.team', 'team')
    }

    query = query.leftJoin('team.files', 'file', 'file.fileId = :fileId', { fileId })
      .addSelect('file.permission')
      .getMany()

    const data: User[] = await query

    const usersMap: {[key: number]: FilePermission[]} = data.reduce((pre, user: User) => {
      const filesPermission = user.positions.reduce((pre: FilePermission[], curr) => {
        const teamFiles = curr.team.files.map(f => f.permission)
        return pre.concat(teamFiles)
      }, [])

      return {...pre, [user.id]: filesPermission}
    }, {})

    return usersMap
  }

  /**
   * Permissions might need to be recalculated for each time a team changes. If the user
   * is granted permissions from another team, we don't want to accidentally overwrite
   * their permissions or send them an annoying email
   */
  private async getFilePermissionChanges (users: User[], fileId: string, excludeTeamId?: number) {
    const adminOAuth = await this.getAdminOAuth()

    /**
     * File permissions for users for the file in google drive
     */
    const driveFilePermissions = await this.getPermissionFromFile(adminOAuth, fileId)

    let drivePermissionMap: {[email: string]: DriveFilePermission} = {}
    /**
     * Turn permissions into a email hashmap { email: { role: '', id: '', email: '' } }
     */
    driveFilePermissions.forEach((dfp) => {
      if (!dfp.emailAddress) return // anyOneWithLink permission type
      drivePermissionMap[dfp.emailAddress.toLowerCase()] = {
        role: dfp.role,
        id: dfp.id,
        emailAddress: dfp.emailAddress
      }
    })
    /**
     * Hashmap for where the key is userId from users array and value is array of file
     * permissions granted to the user
     */
    const usersFilePermissionsMap = await this.getUsersPermissionsForFile(users, fileId, excludeTeamId)

    const changeActionArray: FilePermissionAction[] = []

    users.forEach(user => {
      const currentDrivePermissionForUser = drivePermissionMap[user.email.toLowerCase()]
      const allowedPermissions = usersFilePermissionsMap[user.id]

      const maxAllowedPermission = this.getMaxPermission(allowedPermissions)

      if (currentDrivePermissionForUser) {  // User already has some sort of permission
        if (maxAllowedPermission === FilePermission.none) {
          changeActionArray.push({
            action: 'delete',
            fileId,
            permissionId: currentDrivePermissionForUser.id
          })
          return
        }

        if (currentDrivePermissionForUser.role !== maxAllowedPermission) {
          changeActionArray.push({
            action: 'change',
            permissionId: currentDrivePermissionForUser.id,
            newPermission: maxAllowedPermission,
            fileId
          })
        }
      } else if (maxAllowedPermission !== FilePermission.none) {
        changeActionArray.push({
          action: 'create',
          newPermission: maxAllowedPermission,
          fileId,
          email: user.email,
          message: `You have been given permission to this file by waterloop`
        })
      }
    })

    return changeActionArray
  }

  private getMaxPermission (permissions: FilePermission[]) {
    const permissionsAsNum = permissions.map(permissionToNumber)

    const max = permissionsAsNum.reduce(
      (pre, curr) => Math.max(pre, curr),
      permissionToNumber(FilePermission.none)
    )

    return numberToPermission(max)
  }
}

export const googleService = new GoogleService()
