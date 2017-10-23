import * as qs from 'qs'
import * as persist from 'node-persist'
import fetch from 'node-fetch'
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

  private refreshToken: string
  private accessToken: string
  private expireTime: number  // Time in milliseconds
  private isAuthenticated: boolean

  constructor () {
    persist.initSync()
    
    this.refreshToken = persist.getItemSync('refreshToken')
    if ( this.refreshToken ) {
      this.onAuthSuccess(this.refreshToken)
    }
  }

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

  async onAuthSuccess (authToken: string): Promise<any> {
    try {
      let tokenInfo: TokenResponse = await this.getAccessTokenFromCode(authToken)
      
      this.refreshToken = tokenInfo.refresh_token
      this.accessToken = tokenInfo.access_token
      this.expireTime = Date.now() + tokenInfo.expires_in
      this.isAuthenticated = true

      this.saveInfo()
      
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  saveInfo() {
    persist.setItem('refreshToken', this.refreshToken)
  }

  reauthenticate () {
    return this.onAuthSuccess(this.refreshToken)
  }

  get authenticated (): Boolean {
    return this.isAuthenticated && Date.now() < this.expireTime
  }
}

export default new GoogleService()
