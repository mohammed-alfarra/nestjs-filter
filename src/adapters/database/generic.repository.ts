import { EntityManager, ObjectLiteral, Repository, SelectQueryBuilder } from 'typeorm'
import { EntityTarget } from 'typeorm'
import { QueryParamsDto } from '../api/dto/query-params.dto'
import { Inject } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FilterService } from '../../domain/ports/filter.service'
import { SortService } from '../../domain/ports/sort.service'
import { PaginationService } from '../../domain/ports/pagination.service'
import { SearchService } from '../../domain/ports/search.service'
import { FilterableConfig } from '../../common'

export class GenericRepository<T extends ObjectLiteral> extends Repository<T> {
    private queryBuilder: SelectQueryBuilder<T> = {} as SelectQueryBuilder<T>

    constructor(
        @Inject(SearchService) private readonly searchService: SearchService,
        @Inject(FilterService) private readonly filterService: FilterService,
        @Inject(SortService) private readonly sortService: SortService,
        @Inject(PaginationService) private readonly paginationService: PaginationService,
        @Inject(Reflector) private readonly reflector: Reflector,
        target: EntityTarget<T>,
        manager: EntityManager
    ) {
        super(target, manager)
    }

    private getEntityFields(): FilterableConfig {
        if (typeof this.target !== 'function') {
            return {} as FilterableConfig
        }

        return this.reflector.get<FilterableConfig>('filterable', this.target)
    }

    private applySearch(search: string, searchableFields: FilterableConfig['searchableFields']): void {
        this.searchService.applySearch(this.queryBuilder, search, searchableFields, this.target)
    }

    private applyFilters(filters: Record<string, any>, filterableFields: FilterableConfig['filterableFields']): void {
        this.filterService.applyFilters(this.queryBuilder, filters, filterableFields, this.target)
    }

    private applySort(
        sortBy: string,
        sortOrder: 'ASC' | 'DESC',
        sortableFields: FilterableConfig['sortableFields']
    ): void {
        this.sortService.applySort(this.queryBuilder, sortBy, sortOrder, sortableFields)
    }

    findWithFilters(queryParams: QueryParamsDto): this {
        const { search, sortBy, sortOrder = 'ASC', page, pageSize, ...filters } = queryParams

        const { searchableFields, filterableFields, sortableFields, relationshipFields } = this.getEntityFields()

        this.queryBuilder = this.createQueryBuilder('entity')

        if (relationshipFields && Array.isArray(relationshipFields)) {
            for (const relation of relationshipFields) {
                this.queryBuilder = this.queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation)
            }
        }

        if (search && searchableFields) {
            this.applySearch(search, searchableFields)
        }

        if (filters && filterableFields) {
            this.applyFilters(filters, filterableFields)
        }

        if (sortBy && sortableFields) {
            this.applySort(sortBy, sortOrder, sortableFields)
        }

        return this
    }

    async withPagination(page: number, pageSize: number): Promise<any> {
        const { meta, links } = await this.paginationService.applyPagination(this.queryBuilder, page, pageSize)

        const data = await this.queryBuilder.getMany()

        return { data, meta, links }
    }

    async get(): Promise<T[]> {
        return await this.queryBuilder.getMany()
    }
}
