import { createParamDecorator, Action, InternalServerError } from 'routing-controllers'
import UserService from '../../services/userService'
import GoogleService from '../../services/googleService'
import { OAuthBearer } from '../../types'

export function AdminUser (options?: { required?: boolean }) {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: async () => {
      const admin = await UserService.getAdminUser()

      if (!admin.googleAuth) throw new InternalServerError('Admin has not been authenticated with google')

      const isGoogleAuthenticated = GoogleService.isAuthenticated(admin.googleAuth)

      if (!isGoogleAuthenticated) {
        const newBearer: OAuthBearer = await GoogleService.reauthenticate(admin.googleAuth)
        admin.googleAuth.token = newBearer.token
        admin.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
        await UserService.save(admin)
        UserService.removeAdminCache() // Uncache the admin so it changes later on
      }

      return admin
    }
  })
}
