import * as qs from 'qs'
import fetch, { RequestInit, Response } from 'node-fetch'
import User from '../models/user'
import { OAuthBearer } from '../types'
const googleConfig = require('../../client_id.json')

export interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: 'Bearer'
  refresh_token: string
}

export interface DriveListOptions {
  corpora?: 'default' | 'domain' | 'teamDrive' | 'allTeamDrives'
  maxResults?: number
  orderBy?: 'createdDate' | 'folder' | 'lastViewedByMeDate' | 'modifiedByMeDate' | 'modifiedDate'
  pageToken: string
  | 'quotaBytesUsed' | 'recency' | 'sharedWithMeDate' | 'starred' | 'title'
  q?: string
}

export interface DriveListResponse {
  nextPageToken?: string

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
      response_type: 'code'
    }

    return `${this.USER_REDIRECT}?${qs.stringify(params)}`
  }

  /**
   * When authentication is successful and a code is obtained
   */
  static async onAuthSuccess (authToken: string): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(authToken)
  }

  /**
   * Check to see if the server is currently authenticated
   */
  static isAuthenticated (auth: OAuthBearer): boolean {
    return 'token' in auth && auth.tokenExpireDate.getTime() < Date.now()
  }

  /**
   * Use the OAuthBearer data and create a new one by reauthenticating
   */
  static async reauthenticate (auth: OAuthBearer): Promise<OAuthBearer> {
    return this.getAccessTokenFromCode(auth.refreshToken)
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

  /**
   * Return list of files
   */
  static async getListOfFiles (auth: OAuthBearer, options: DriveListOptions) {
    const queryString = qs.stringify(options)

    const result = await this.authFetch(`${this.FILE_LIST_URL}?${queryString}`, auth.token)
    const data = await result.json()

    if (!result.ok) throw data
    return data
  }

  /**
   * Given a code, try to get an access token
   */
  private static async getAccessTokenFromCode (code: string): Promise<OAuthBearer> {
    const body = {
      code,
      client_id: googleConfig.client_id,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: this.CALLBACK_URL,
      grant_type: 'authorization_code'
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
