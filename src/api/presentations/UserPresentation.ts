import User from '../models/User'

/**
 * @todo: include positions
 */
export const presentUserFull = (user: User) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  createDate: user.createDate,
  phoneNumber: user.phoneNumber,
  address: user.address
})
