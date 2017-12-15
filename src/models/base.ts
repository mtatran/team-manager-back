import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm'

export class Base {
  @PrimaryGeneratedColumn()
  id: number

  @CreateDateColumn()
  createDate: Date

  @UpdateDateColumn()
  updateDate: Date
}
