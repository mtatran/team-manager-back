import { User } from '../models/user'
import { userPosition } from './positionPresentation'

/**
 * @api {OBJECT} PartialUser PartialUser
 * @apiGroup Custom types
 * @apiVersion 1.0.0
 *
 * @apiSuccess {String} firstName
 * @apiSuccess {String} lastName
 * @apiSuccess {String} email
 * @apiSuccess {String} slackTag
 * @apiSuccess {Enum} authority "member", "admin"
 */
export const partialUser = (user: User) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  slackTag: user.slackTag,
  authority: user.authority
})

/**
 * @apiDefine success_user_full
 *
 * @apiSuccess {Integer} id
 * @apiSuccess {String} firstName
 * @apiSuccess {String} lastName
 * @apiSuccess {String} email
 * @apiSuccess {String} phoneNumber
 * @apiSuccess {String} address
 * @apiSuccess {ISODate} createDate
 * @apiSuccess {[UserPosition](#api-Custom_types-ObjectUserposition)[]} positions
 */
export const fullUser = (user: User) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  createDate: user.createDate,
  phoneNumber: user.phoneNumber,
  address: user.address,
  email: user.email,
  positions: user.positions.map(userPosition)
})
