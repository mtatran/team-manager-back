import { NotFoundError } from 'routing-controllers'
import { getCustomRepository } from 'typeorm'
import { UserRepository } from '../repositories/userRepository'

class UserService {
  async findOneById (id: string | number) {
    const user = await getCustomRepository(UserRepository).findOneById(id)
    if (!user) throw new NotFoundError(`User with id ${id} does not exist`)
    return user
  }
}

export const userService = new UserService()
