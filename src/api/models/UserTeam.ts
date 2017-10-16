import {Entity, Column, Index} from 'typeorm'
import Base from './Base'

@Entity()
@Index(['teamId', 'userId'])
export default class UserTeam extends Base {
  @Column()
  teamId: number

  @Column()
  userId: number
  
}
