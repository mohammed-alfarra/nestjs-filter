import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FilterModule } from '../../src/filter.module'
import { MockEntity } from './mock-entity.entity'

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: ':memory:',
            entities: [MockEntity],
            synchronize: true,
        }),
        FilterModule.forFeature(MockEntity),
    ],
})
export class AppModule {}
