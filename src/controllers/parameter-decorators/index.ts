import { createParamDecorator, InternalServerError } from 'routing-controllers'
import GoogleService from '../../services/googleService'
import { OAuthBearer } from '../../types'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../../repositories/userRepository'

export function AdminUser (options?: { required?: boolean }) {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: async () => {
      const userRepo = getCustomRepository(UserRepository)
      const admin = await userRepo.getSuperAdminUser()

      if (!admin.googleAuth) throw new InternalServerError('Admin has not been authenticated with google')

      const isGoogleAuthenticated = GoogleService.isTokenValid(admin.googleAuth)

      if (!isGoogleAuthenticated) {
        const newBearer: OAuthBearer = await GoogleService.reauthenticate(admin.googleAuth)
        admin.googleAuth.token = newBearer.token
        admin.googleAuth.tokenExpireDate = newBearer.tokenExpireDate
        await userRepo.saveWithValidation(admin)
        await userRepo.removeSuperAdminFromCache() // Uncache the admin so it changes later on
      }

      return admin
    }
  })
}
