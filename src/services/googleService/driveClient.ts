import axios, { AxiosInstance } from 'axios'
import * as assert from 'assert'
import * as qs from 'qs'
import { AUTH_TOKEN_URL, USER_REDIRECT } from './constants'
import { TokenResponse } from './types'
import { OAuthBearer, FilePermission } from '../../types/index'
import { AddPermissionOptions } from './index'
const googleConfig = require('../../../client_id.json')

export default class DriveClient {
  private token: OAuthBearer

  constructor (token: OAuthBearer) {
    this.token = token
  }

  /**
   * Get auth url to redirect user to to begin the Oauth2 Handshake
   */
  static getAuthUrl (scope: string) {
    const params = {
      client_id: googleConfig.client_id,
      redirect_uri: DriveClient.callbackUrl,
      scope: scope,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent'
    }

    return `${USER_REDIRECT}?${qs.stringify(params)}`
  }

  /**
   * Get OAuthBearer object from code. The code could be refresh or not
   */
  static async getAuthTokenFromCode (code: string, refresh?: boolean) {
    let body: any = {
      client_id: googleConfig.client_id,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: DriveClient.callbackUrl
    }

    if (refresh) {
      body.refresh_token = code
      body.grant_type = 'refresh_token'
    } else {
      body.code = code
      body.grant_type = 'authorization_code'
    }

    const response = await axios.post(AUTH_TOKEN_URL, qs.stringify(body))
    const data: TokenResponse = response.data

    return this.transformTokenResponseToOauth(data)
  }

  /**
   * Turn a TokenResponse object into a OAuthBearer object
   */
  private static transformTokenResponseToOauth (token: TokenResponse): OAuthBearer {
    return {
      refreshToken: token.refresh_token,
      token: token.access_token,
      tokenExpireDate: new Date(Date.now() + token.expires_in)
    }
  }

  /**
   * Get callback url
   */
  private static get callbackUrl () {
    return `${process.env.HOST}/api/google/callback`
  }

  /**
   * Check to see if the token is still valid
   */
  private static isTokenValid (token: OAuthBearer) {
    return 'token' in token && token.tokenExpireDate.getTime() > Date.now()

  }

  /**
   * Give permission to a file
   */
  async addFilePermission (file: string, email: string, permission: FilePermission, options: AddPermissionOptions) {
    if (permission === FilePermission.owner) options.transferOwnership = true
    const queryParam = qs.stringify(options)
    const url = `https://www.googleapis.com/drive/v3/files/${file}/permissions?${queryParam}`
    const body = {
      role: permission,
      type: 'user',
      emailAddress: email
    }
    const axios = await this.getAuthedAxios()
    return axios.post(url, body)
  }

  /**
   * Get File permission
   */
  async getFilePermission (file: string) {
    const url = `https://www.googleapis.com/drive/v3/files/${file}/permissions`
    const query = {
      fields: 'permissions(role,emailAddress,id)'
    }

    const axios = await this.getAuthedAxios()
    return (await axios.get(`${url}?${qs.stringify(query)}`)).data
  }

  /**
   * Remove permissions from a file
   */
  async removeFilePermision (file: string, permissionId: string) {
    const url = `https://www.googleapis.com/drive/v2/files${file}/permissions/${permissionId}`
    const axios = await this.getAuthedAxios()
    return axios.delete(url)
  }

  /**
   * Update file permission
   */
  async updateFilePermission (file: string, permissionId: string, permission: FilePermission) {
    const url = `https://www.googleapis.com/drive/v3/files/${file}/permissions/${permissionId}`

    const body = { role: permission }
    const axios = await this.getAuthedAxios()
    return axios.patch(url, body)
  }

  /**
   * Get an authenticated axios instance by setting the default authorization header
   */
  private async getAuthedAxios () {
    assert(this.token)

    if (!DriveClient.isTokenValid(this.token)) {
      this.token = await DriveClient.getAuthTokenFromCode(this.token.refreshToken, true)
    }

    return axios.create({
      headers: { Authorization: `Bearer ${this.token.token}`}
    })
  }

}
