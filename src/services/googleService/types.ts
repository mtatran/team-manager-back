import { FilePermission } from '../../types'

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

export interface DriveFileWithOwner extends DriveFile {
  owners: {
    kind: string
    displayName: string
    me: boolean
    permissionId: string
    emailAddress: string
  }[]
}

export interface DriveFilePermission {
  role: FilePermission
  emailAddress: string
  id: string
}

export interface DriveListResponse {
  nextPageToken?: string
  incompleteSearch: boolean
  files: DriveFile[]
}

export interface AddPermissionOptions {
  emailMessage?: string
  sendNotificationEmails?: boolean
  transferOwnership?: boolean
}
