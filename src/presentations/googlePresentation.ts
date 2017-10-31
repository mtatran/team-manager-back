import { DriveListResponse } from '../services/googleService'

/**
 * @apiDefine success_google_list_response
 *
 * @apiSuccess {String} id
 * @apiSuccess {String} name
 * @apiSuccess {Boolean} canShare If the user has the permission to share this folder
 */
export const listResponse = (response: DriveListResponse) => ({
  nextPageToken: response.nextPageToken,
  files: response.files.map(file => ({
    id: file.id,
    name: file.name,
    canShare: file.capabilities.canShare,
    mimeType: file.mimeType
  }))
})
