import { Provider } from '@nestjs/common';
import { DataSource, EntityTarget, ObjectLiteral } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { SearchService } from '../domain/ports/search.service';
import { FilterService } from '../domain/ports/filter.service';
import { SortService } from '../domain/ports/sort.service';
import { PaginationService } from '../domain/ports/pagination.service';
import { GenericRepository } from '../adapters';

export function GenericRepositoryFactory(): Provider {
    return {
        provide: 'GENERIC_REPOSITORY_FACTORY',
        useFactory: (
            searchService: SearchService,
            filterService: FilterService,
            sortService: SortService,
            paginationService: PaginationService,
            reflector: Reflector,
            dataSource: DataSource
        ) => {
            return <T extends ObjectLiteral>(entity: EntityTarget<T>) => {
                return new GenericRepository<T>(
                    searchService,
                    filterService,
                    sortService,
                    paginationService,
                    reflector,
                    entity,
                    dataSource.manager,
                );
            };
        },
        inject: [
            SearchService,
            FilterService,
            SortService,
            PaginationService,
            Reflector,
            DataSource
        ]
    };
}
