import User from '../models/User'

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
 */
export const presentUserFull = (user: User) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  createDate: user.createDate,
  phoneNumber: user.phoneNumber,
  address: user.address,
  email: user.email
})
