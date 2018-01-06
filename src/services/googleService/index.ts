/**
 * This file is for implementing a service to interact with google drive's api
 *
 * Resources for additional information:
 * https://developers.google.com/drive/v2/reference/files#resource
 */
import * as qs from 'qs'
import * as assert from 'assert'
import * as _ from 'lodash'
import { OAuthBearer, FilePermission, FilePermissionAction } from '../../types'
import {
  AddPermissionOptions,
  DriveFile,
  DriveFileCapabilities,
  DriveFilePermission,
  DriveListOptions,
  DriveListResponse,
  TokenResponse
} from './types'
import { AUTH_TOKEN_URL, FILE_LIST_URL, USER_REDIRECT } from './constants'
export * from './types'
import { UserTeamService } from '../base/userTeamService'
import DriveClient from './driveClient'
import { Team } from '../../models/team'
import { User } from '../../models/user'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../../repositories/userRepository'
import { FileRepository } from '../../repositories/fileRepository'

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
  isAuthenticated (auth: OAuthBearer): boolean {
    return 'token' in auth && auth.tokenExpireDate.getTime() > Date.now()
  }

  /**
   * Use the OAuthBearer data and create a new one by reauthenticating
   */
  async reauthenticate (auth: OAuthBearer): Promise<OAuthBearer> {
    return DriveClient.getAuthTokenFromCode(auth.refreshToken, true)
  }

  /**
   * Adds email with permission to file. If successful, returns the permission id
   */
  async giveEmailFilePermission (
    auth: OAuthBearer,
    fileId: string,
     email: string,
     permission: FilePermission,
     options: Partial<AddPermissionOptions> = {}): Promise<string> {

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

  async getPermissionFromFile (auth: OAuthBearer, fileId: string): Promise<DriveFilePermission[]> {
    return new DriveClient(auth)
      .getFilePermission(fileId) as any
  }

  async updatePermissionForFile (auth: OAuthBearer, fileId: string, permissionId: string, permission: FilePermission) {
    return new DriveClient(auth)
      .updateFilePermission(fileId, permissionId, permission)
  }

  saveFilePermissionActions (auth: OAuthBearer, actions: FilePermissionAction[]) {
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
   * The team must have users array filled
   */
  beforeTeamDelete (team: Team) {
    assert(team.positions, 'team does not contain poisitions')

  }

  private async getAdminOAuth (): Promise<OAuthBearer> {
    const admin = await getCustomRepository(UserRepository).getSuperAdminUser()
    assert(admin, 'Super admin currently does not exist')
    assert(admin.googleAuth, 'Super admin is not authenticated to google')

    return admin.googleAuth as any
  }

  /**
   * Permissions might need to be recalculated for each time a team changes. If the user
   * is granted permissions from another team, we don't want to accidentally overwrite
   * their permissions or send them an annoying email
   */
  private async getFilePermissionChanges (users: User[], fileId: string) {
    const adminOAuth = await this.getAdminOAuth()

    // Get permissions for the current file
    const driveFilePermissions = await this.getPermissionFromFile(adminOAuth, fileId)

    // Turn permissions into a email hashmap { email: { role: '', id: '', email: '' } }
    const drivePermissionMap: {[key: string]: DriveFilePermission} = driveFilePermissions.reduce(
      (prev, curr) => ({ ...prev, [curr.emailAddress.toLowerCase()]: curr}),
      {}
    )

    const teamIds = users.map(user => user.positions.map(pos => pos.teamId))
    const uniqueTeamIds = _.union(...teamIds)
    const teamFilePermissions = await getCustomRepository(FileRepository).find({
      where: { team: uniqueTeamIds, fileId }
    })
    const changeActionArray: FilePermissionAction[] = []

    users.forEach(user => {
      const userTeamIds = user.positions.map(pos => pos.teamId)
      const applicablePermissions = teamFilePermissions
        .filter(file => userTeamIds.indexOf(file.teamId) >= 0)
        .map(file => file.permission)

      const currentPermission = drivePermissionMap[user.email.toLowerCase()]
      const maxGivenPermission = this.getMaxPermission(applicablePermissions)

      if (maxGivenPermission === currentPermission.role) return
      if (maxGivenPermission === FilePermission.none) {
        changeActionArray.push({ action: 'delete', permissionId: currentPermission.id, fileId })
      } else if (currentPermission.role === FilePermission.none) {
        changeActionArray.push({ action: 'create', newPermission: maxGivenPermission, email: user.email, fileId})
      } else {
        changeActionArray.push({ action: 'change', newPermission: maxGivenPermission, fileId, permissionId: currentPermission.id })
      }
    })

    return changeActionArray
  }

  private getMaxPermission (permissions: FilePermission[]) {
    const permissionsAsNum = permissions.map(FilePermission.permissionToNumber)

    const max = permissionsAsNum.reduce(
      (pre, curr) => Math.max(pre, curr),
      FilePermission.permissionToNumber(FilePermission.none)
    )

    return FilePermission.numberToPermission(max)
  }

}

export default new GoogleService()
