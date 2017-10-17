import {Entity, Column, Index, JoinColumn, OneToOne} from 'typeorm'
import Base from './Base'
import Team from './Team'
import User from './User'

@Entity()
@Index(['teamId', 'userId'])
export default class UserTeam extends Base {
  @Column()
  level: number

  @OneToOne(type => Team)
  @JoinColumn({name: 'teamId'})
  team: Team
  
  @OneToOne(type => User)
  @JoinColumn({name: 'userId'})
  user: User
}
