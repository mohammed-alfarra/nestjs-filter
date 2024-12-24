import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class MockEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column({ type: 'varchar', length: 255 })
    name!: string

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number
}
