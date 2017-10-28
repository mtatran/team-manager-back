import { CreateDateColumn, UpdateDateColumn, ObjectIdColumn, ObjectID } from 'typeorm'

export default class Base {
  @ObjectIdColumn()
  id: ObjectID

  @CreateDateColumn()
  createDate: Date

  @UpdateDateColumn()
  updateDate: Date
}
