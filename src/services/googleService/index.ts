/**
 * This file is for implementing a service to interact with google drive's api
 *
 * Resources for additional information:
 * https://developers.google.com/drive/v2/reference/files#resource
 */
import * as qs from 'qs'
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
import DriveClient from './driveClient'

class GoogleService {
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

}

export default new GoogleService()
