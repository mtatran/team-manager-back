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
import { getCustomRepository, getRepository, getConnectionManager } from 'typeorm'
import { UserRepository } from '../../repositories/userRepository'
import { FileRepository } from '../../repositories/fileRepository'
import { race } from 'q'
import { File } from '../../models/file'
import { Position } from '../../models/position'
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder'

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
    const data = await new DriveClient(auth).getFilePermission(fileId)
    return data.permissions as any
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

  beforeTeamDelete (team: Team) {
    const users = team.positions.map(pos => pos.user)
    this.getFilePermissionChanges(users, '0B2_zix-T-cLPNktuRGRaTUotbUU')
  }

  private async getAdminOAuth (): Promise<OAuthBearer> {
    let admin = await getCustomRepository(UserRepository).getSuperAdminUser()
    assert(admin, 'Super admin currently does not exist')
    assert(admin.googleAuth, 'Super admin is not authenticated to google')

    if (!this.isTokenValid(admin.googleAuth as OAuthBearer)) {
      admin = await this.refreshUserOAuthToken(admin)
    }

    return admin.googleAuth as OAuthBearer
  }

  private async getUsersPermissionsForFile (user: User[], fileId: string, excludeTeamId?: string) {
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
      const userId = user.id

      const filesPermission = user.positions.reduce((pre: FilePermission[], curr) => {
        const teamFiles = curr.team.files.map(f => f.permission)
        return pre.concat(teamFiles)
      }, [])

      return {...pre, [userId]: filesPermission}
    }, {})

    return usersMap
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

    const usersFilePermissions = await this.getUsersPermissionsForFile(users, fileId)
    console.log(usersFilePermissions)

    // const teamIds = users.map(user => user.positions.map(pos => pos.teamId))
    // const uniqueTeamIds = _.union(...teamIds)
    // const teamFilePermissions = await getCustomRepository(FileRepository).find({
    //   where: { team: uniqueTeamIds, fileId }
    // })

    // const changeActionArray: FilePermissionAction[] = []

    // users.forEach(user => {
    //   const userTeamIds = user.positions.map(pos => pos.teamId)
    //   const applicablePermissions = teamFilePermissions
    //     .filter(file => userTeamIds.indexOf(file.teamId) >= 0)
    //     .map(file => file.permission)

    //   const currentPermission = drivePermissionMap[user.email.toLowerCase()]
    //   const maxGivenPermission = this.getMaxPermission(applicablePermissions)

    //   if (maxGivenPermission === currentPermission.role) return
    //   if (maxGivenPermission === FilePermission.none) {
    //     changeActionArray.push({ action: 'delete', permissionId: currentPermission.id, fileId })
    //   } else if (currentPermission.role === FilePermission.none) {
    //     changeActionArray.push({ action: 'create', newPermission: maxGivenPermission, email: user.email, fileId})
    //   } else {
    //     changeActionArray.push({ action: 'change', newPermission: maxGivenPermission, fileId, permissionId: currentPermission.id })
    //   }
    // })

    // return changeActionArray
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
