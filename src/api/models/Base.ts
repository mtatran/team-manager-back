import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm'

export default class Base {

  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createDate: Date

  @UpdateDateColumn()
  updateDate: Date
}
