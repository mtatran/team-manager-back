/**
 * This file is for implementing a service to interact with google drive's api
 *
 * Resources for additional information:
 * https://developers.google.com/drive/v2/reference/files#resource
 */

import * as qs from 'qs'
import fetch, { RequestInit, Response } from 'node-fetch'
import User from '../models/user'
import { OAuthBearer, OAuthBearerWithRefresh, FilePermission } from '../types'
const googleConfig = require('../../client_id.json')

export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: 'Bearer'
  refresh_token: string
}

export interface DriveListOptions {
  corpora?: 'default' | 'domain' | 'teamDrive' | 'allTeamDrives'
  pageSize?: number
  orderBy?: 'createdDate' | 'folder' | 'lastViewedByMeDate' | 'modifiedByMeDate' | 'modifiedDate'
  pageToken?: string
  | 'quotaBytesUsed' | 'recency' | 'sharedWithMeDate' | 'starred' | 'title'
  q?: string
}

/**
 * This is a partial definition, only including fields that matter
 */
export interface DriveFileCapabilities {
  canShare: boolean
}

/**
 * This is a partial definition and does not include everything
 * that google drive returns. It only includes the important stuff
 */
export interface DriveFile {
  id: string
  name: string
  mimeType: string
  capabilities: DriveFileCapabilities
}

export interface DriveFilePermission {
  role: FilePermission
  emailAddress: string
}

export interface DriveListResponse {
  nextPageToken?: string
  incompleteSearch: boolean
  files: DriveFile[]
}

export interface AddPermissionOptions {
  emailMessage: string
  sendNotificationEmails: boolean
  transferOwnership: boolean
}

class GoogleService {
  static USER_REDIRECT = 'https://accounts.google.com/o/oauth2/v2/auth'
  static AUTH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
  static CALLBACK_URL = `${process.env.URL}/api/google/callback`
  static FILE_LIST_URL = 'https://www.googleapis.com/drive/v3/files'

  /**
   * Generates the URL that users should be redirected to the initiate
   * the OAuth2 process
   */
  static getAuthUrl (): string {
    const params = {
      client_id: googleConfig.client_id,
      redirect_uri: this.CALLBACK_URL,
      scope: 'https://www.googleapis.com/auth/drive',
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent'
    }

    return `${this.USER_REDIRECT}?${qs.stringify(params)}`
  }

  /**
   * When authentication is successful and a code is obtained
   */
  static async onAuthSuccess (code: string): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(code, false)
  }

  /**
   * Check to see if the server is currently authenticated
   */
  static isAuthenticated (auth: OAuthBearer): boolean {
    return 'token' in auth && auth.tokenExpireDate.getTime() > Date.now()
  }

  /**
   * Use the OAuthBearer data and create a new one by reauthenticating
   */
  static async reauthenticate (auth: OAuthBearer): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(auth.refreshToken, true)
  }

  /**
   * Fetch that automatically includes the Bearer token in the header
   * so that the call is authenticated
   */
  static async authFetch (url: string, token: string, init: RequestInit = {}): Promise<Response> {
    let headers: any = {
      Authorization: `Bearer ${token}`,
      ...init.headers
    }

    return fetch(url, {
      ...init,
      headers
    })
  }

  static async getFile (auth: OAuthBearer, fileId: string): Promise<DriveFile> {
    let url = `https://www.googleapis.com/drive/v2/files/${fileId}`

    const result = await this.authFetch(url, auth.token)
    const data = await result.json()

    if (result.ok) return data
    else throw data
  }

  /**
   * Return list of files
   */
  static async getListOfFiles (auth: OAuthBearer, options: DriveListOptions = {}): Promise<DriveListResponse> {
    const queryString = qs.stringify(options)
    const fields = 'nextPageToken,incompleteSearch,files(id,name,mimeType,capabilities/canShare)'

    const result = await this.authFetch(`${this.FILE_LIST_URL}?fields=${fields}&${queryString}`, auth.token)
    const data = await result.json()

    if (!result.ok) throw data
    return data
  }

  /**
   * Adds email with permission to file. If successful, returns the permission id
   */
  static async giveEmailFilePermission (auth: OAuthBearer, fileId: string, email: string, permission: FilePermission, options: Partial<AddPermissionOptions> = {}): Promise<string> {
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
  static async removePermissionFromFile (auth: OAuthBearer, fileId: string, permissionId: string) {
    const urlPath = `https://www.googleapis.com/drive/v2/files${fileId}/permissions/${permissionId}`

    const result = await this.authFetch(urlPath, auth.token, { method: 'DELETE' })

    if (result.ok) return
    else throw new Error('Could not remove permission')

  }

  static async getPermissionFromFile (auth: OAuthBearer, fileId: string):
    Promise<DriveFilePermission[]> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`
    const query = {
      fields: 'permissions(role,emailAddress)'
    }

    const result = await this.authFetch(`${url}?${qs.stringify(query)}`, auth.token)
    const data = await result.json()

    if (result.ok) return data.permissions
    else throw new Error(data)
  }

  /**
   * Given a code, try to get an access token
   */
  private static async getAccessTokenFromCode (code: string, refresh: boolean): Promise<OAuthBearer> {
    const body = {
      code: refresh ? undefined : code,
      refresh_token: refresh ? code : undefined,
      client_id: googleConfig.client_id,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: this.CALLBACK_URL,
      grant_type: refresh ? 'refresh_token' : 'authorization_code'
    }

    let result = await fetch(this.AUTH_TOKEN_URL, {
      method: 'POST',
      body: qs.stringify(body),
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'}
    })

    let data = await result.json() as TokenResponse
    if (!result.ok) throw data

    return this.responseToOAuth(data)
  }

  private static responseToOAuth (auth: TokenResponse): OAuthBearer {
    return {
      refreshToken: auth.refresh_token,
      token: auth.access_token,
      tokenExpireDate: new Date(Date.now() + auth.expires_in)
    }
  }
}

export default GoogleService
