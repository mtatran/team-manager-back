import { DriveListResponse } from '../services/googleService'

/**
 * @apiDefine success_google_list_response
 *
 * @apiSuccess {String} id
 * @apiSuccess {String} title
 * @apiSuccess {String} description
 * @apiSuccess {Boolean} canShare If the user has the permission to share this folder
 */
export const listResponse = (response: DriveListResponse) => ({
  nextPageToken: response.nextPageToken,
  items: response.items.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    canShare: item.capabilities.canShare
  }))
})
