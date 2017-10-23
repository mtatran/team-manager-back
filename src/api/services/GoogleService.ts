import * as qs from 'qs'
import * as persist from 'node-persist'
import fetch, {RequestInit, Response} from 'node-fetch'
const googleConfig = require('../../../client_id.json')

interface TokenResponse {
  access_token: string
  expires_in: number
  token_type: 'Bearer'
  refresh_token: string
}

class GoogleService {
  USER_REDIRECT = 'https://accounts.google.com/o/oauth2/v2/auth'
  AUTH_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token'
  CALLBACK_URL = `${process.env.URL}/api/auth/google/callback`
  FILE_LIST_URL = 'https://www.googleapis.com/drive/v3/files'

  private refreshToken: string
  private accessToken: string
  private expireTime: number  // Time in milliseconds
  private isAuthenticated: boolean

  constructor () {
    persist.initSync()
    
    this.refreshToken = persist.getItemSync('refreshToken')
    if ( this.refreshToken ) {
      this.getAccessTokenFromCode(this.refreshToken)
    }
  }

  /**
   * Generates the URL that users should be redirected to the initiate
   * the OAuth2 process
   */
  getAuthUrl (): string {
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
   * Given a code, try to get an access token
   */
  private async getAccessTokenFromCode (code = this.refreshToken): Promise<TokenResponse> {
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

    let data = await result.json()
    if(!result.ok) throw data
    return data as TokenResponse
  }

  onAuthFailed () {
    this.isAuthenticated = false
  }

  /**
   * When authentication is successful and a code is obtained
   */
  async onAuthSuccess (authToken: string): Promise<any> {
    let tokenInfo: TokenResponse = await this.getAccessTokenFromCode(authToken)
    
    this.refreshToken = tokenInfo.refresh_token
    this.accessToken = tokenInfo.access_token
    this.expireTime = Date.now() + tokenInfo.expires_in
    this.isAuthenticated = true
    this.saveInfo()
  }

  /**
   * Save the refresh token in persistent memory so that the user doesn't
   * have to authenticate even if the server restarts
   */
  private saveInfo() {
    persist.setItem('refreshToken', this.refreshToken)
  }

  /**
   * Try to use the refresh token to get a new access token 
   * (since the access token expires after around an hour)
   */
  private async reauthenticate () {
    const authInfo = await this.getAccessTokenFromCode(this.refreshToken)
    
    this.accessToken = authInfo.access_token
    this.expireTime = Date.now() + authInfo.expires_in
  }

  /**
   * Check to see if the server is currently authenticated
   */
  get authenticated (): Boolean {
    return this.isAuthenticated && Date.now() < this.expireTime
  }

  /**
   * Fetch that automatically includes the Bearer token in the header
   * so that the call is authenticated
   */
  async authFetch (url: string, init: RequestInit = {}): Promise<Response> {
    if (! this.authenticated) await this.reauthenticate()
    
    let headers: any = {
      Authorization: `Bearer ${this.accessToken}`,
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
  async getListOfFiles() {
    const result = await this.authFetch(this.FILE_LIST_URL)
    const data = await result.json()

    if(!result.ok) throw data
    return data
  }
}

export default new GoogleService()
