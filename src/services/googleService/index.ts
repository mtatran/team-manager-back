/**
 * This file is for implementing a service to interact with google drive's api
 *
 * Resources for additional information:
 * https://developers.google.com/drive/v2/reference/files#resource
 */
import * as qs from 'qs'
import axios from 'axios'
import gapi from 'googleapis'
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
const googleConfig = require('../../client_id.json')

class GoogleService {
  /**
   * Generates the URL that users should be redirected to the initiate
   * the OAuth2 process
   */
  static getAuthUrl (): string {
    const params = {
      client_id: googleConfig.client_id,
      redirect_uri: this.callBackUrl,
      scope: 'https://www.googleapis.com/auth/drive',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent'
    }

    return `${USER_REDIRECT}?${qs.stringify(params)}`
  }

  /**
   * When authentication is successful and a code is obtained
   */
  async onAuthSuccess (code: string): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(code, false)
  }

  /**
   * Check to see if the server is currently authenticated
   */
  isAuthenticated (auth: OAuthBearer): boolean {
    return 'token' in auth && auth.tokenExpireDate.getTime() > Date.now()
  }

  /**
   * Use the OAuthBearer data and create a new one by reauthenticating
   */
  async reauthenticate (auth: OAuthBearer): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(auth.refreshToken, true)
  }

  /**
   * Fetch that automatically includes the Bearer token in the header
   * so that the call is authenticated
   */
  async authFetch (token: string) {
    return axios.create({
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  async getFile (auth: OAuthBearer, fileId: string): Promise<DriveFile> {
    let url = `https://www.googleapis.com/drive/v2/files/${fileId}`

    const result = await this.authFetch(url, auth.token)
    const data = await result.json()

    if (result.ok) return data
    else throw data
  }

  /**
   * Return list of files
   */
  async getListOfFiles (auth: OAuthBearer, options: DriveListOptions = {}): Promise<DriveListResponse> {
    const queryString = qs.stringify(options)
    const fields = 'nextPageToken,incompleteSearch,files(id,name,mimeType,capabilities/canShare)'

    const result = await this.authFetch(`${FILE_LIST_URL}?fields=${fields}&${queryString}`, auth.token)
    const data = await result.json()

    if (!result.ok) throw data
    return data
  }

  /**
   * Adds email with permission to file. If successful, returns the permission id
   */
  async giveEmailFilePermission (auth: OAuthBearer, fileId: string, email: string, permission: FilePermission, options: Partial<AddPermissionOptions> = {}): Promise<string> {
    if (permission === FilePermission.owner) options.transferOwnership = true
    const urlPath = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`
    const queryParam = qs.stringify(options)
    const body = JSON.stringify({
      role: permission,
      type: 'user',
      emailAddress: email
    })

    const url = `${urlPath}?${queryParam}`
    const result = await this.authFetch(url, auth.token, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body
    })

    const data = await result.json()
    if (result.ok) return data.id
    else throw data // Parse these to provide more insightful errors (BOOM0)
  }

  /**
   * Removes permission from a file
   */
  async removePermissionFromFile (auth: OAuthBearer, fileId: string, permissionId: string) {
    const urlPath = `https://www.googleapis.com/drive/v2/files${fileId}/permissions/${permissionId}`
    const result = await this.authFetch(urlPath, auth.token, { method: 'DELETE' })
    if (result.ok) return
    else throw new Error('Could not remove permission')

  }

  async getPermissionFromFile (auth: OAuthBearer, fileId: string):
    Promise<DriveFilePermission[]> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`
    const query = {
      fields: 'permissions(role,emailAddress,id)'
    }

    const result = await this.authFetch(`${url}?${qs.stringify(query)}`, auth.token)
    const data = await result.json()

    if (result.ok) {
      return data.permissions.map((permission: any) => ({
        ...permission,
        role: FilePermission[permission.role]
      }))
    } else throw new Error(data)
  }

  async updatePermissionForFile (auth: OAuthBearer, fileId: string, permissionId: string, permission: FilePermission) {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions/${permissionId}`
    const body = {
      role: this.filePermissionToText(permission)
    }

    const result = await this.authFetch(url, auth.token, {
      method: 'PATCH',
      body: JSON.stringify(body)
    })

    if (result.ok) return null
    else throw new Error(await result.text())
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

  private async filePermissionToText (permission: FilePermission) {
    switch (permission) {
      case FilePermission.owner: return 'owner'
      case FilePermission.reader: return 'reader'
      case FilePermission.writer: return 'writer'
      default: return 'none'
    }
  }

  /**
   * Given a code, try to get an access token
   */
  private async getAccessTokenFromCode (code: string, refresh: boolean): Promise<OAuthBearer> {
    const body = {
      code: refresh ? undefined : code,
      refresh_token: refresh ? code : undefined,
      client_id: googleConfig.client_id,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: this.callBackUrl,
      grant_type: refresh ? 'refresh_token' : 'authorization_code'
    }

    let result = await fetch(AUTH_TOKEN_URL, {
      method: 'POST',
      body: qs.stringify(body),
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'}
    })

    let data = await result.json() as TokenResponse
    if (!result.ok) throw data

    return this.responseToOAuth(data)
  }

  private responseToOAuth (auth: TokenResponse): OAuthBearer {
    return {
      refreshToken: auth.refresh_token,
      token: auth.access_token,
      tokenExpireDate: new Date(Date.now() + auth.expires_in)
    }
  }

  private static get callBackUrl () {
    return `${process.env.HOST}/api/google/callback`
  }
}

export default new GoogleService()
