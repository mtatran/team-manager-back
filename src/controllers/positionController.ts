import { JsonController, Param, NotFoundError, Delete } from 'routing-controllers'
import { getCustomRepository } from 'typeorm'
import { PositionRepository } from '../repositories/positionRepository'

@JsonController('/positions')
export default class PositionController {
  /**
   * @api {POST} /users/login Login
   * @apiName login
   * @apiGroup Users
   * @apiVersion  1.0.0
   *
   * @apiParam {String} [address]
   * @apiParam {String} email
   * @apiParam {String} firstName
   * @apiParam {String} lastName
   * @apiParam {String} [phoneNumber]
   * @apiParam {String} password
   * @apiParam {String} authority
   *
   * @apiParamExample  {JSON} Request-Example:
     {
        address: "111 waterloo st",
        email: "me@tylerzhang.com",
        firstName: "tyler",
        lastName: "zhang",
        phoneNumber: "123-456-789",
        password: "password"
     }
   */
  @Delete('/:positionId')
  async deletePosition (@Param('positionId') positionId: string) {
    const position = await this.getPositionById(positionId)
    await getCustomRepository(PositionRepository).remove(position)

    return null
  }

  private async getPositionById (positionId: string) {
    const position = await getCustomRepository(PositionRepository).findOneById(positionId)
    if (position === undefined) throw new NotFoundError('Position does not exist')
    return position
  }
}
