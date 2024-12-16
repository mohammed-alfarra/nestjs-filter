import { Injectable } from '@nestjs/common'
import { FilterableConfig } from '../../common'
import { SelectQueryBuilder } from 'typeorm'

@Injectable()
export class SortService {
    applySort(
        query: SelectQueryBuilder<any>,
        sortBy: string,
        sortOrder: 'ASC' | 'DESC',
        sortableFields: FilterableConfig['sortableFields'] = []
    ): void {
        if (sortableFields.includes(sortBy)) {
            query.addOrderBy(`entity.${sortBy}`, sortOrder)
        }
    }
}
