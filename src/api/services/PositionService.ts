import Position from '../models/Position'
import service from './Service'

class PositionService extends service<Position> {
  constructor () {
    super(Position)
  }
}

export default new PositionService()
