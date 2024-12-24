import { DynamicModule, Module } from '@nestjs/common'
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm'
import { GenericRepositoryProvider } from './providers/repository.provider'
import { SearchService } from './domain/ports/search.service'
import { FilterService } from './domain/ports/filter.service'
import { SortService } from './domain/ports/sort.service'
import { PaginationService } from './domain/ports/pagination.service'
import { GenericRepositoryFactory } from './providers/repository-factory.provider'

@Module({
    providers: [SearchService, FilterService, SortService, PaginationService, GenericRepositoryFactory()],
    exports: [GenericRepositoryFactory()],
})
export class FilterModule {
    static forFeature<T extends ObjectLiteral>(entity: EntityTarget<T>): DynamicModule {
        return {
            module: FilterModule,
            providers: [GenericRepositoryProvider(entity)],
            exports: ['GENERIC_REPOSITORY'],
        }
    }
}
