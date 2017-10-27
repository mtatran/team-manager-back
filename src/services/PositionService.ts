import Position from '../models/Position'
import BaseModelService from './BaseModelService'

class PositionService extends BaseModelService<Position> {
  constructor () {
    super(Position)
  }
}

export default new PositionService()
