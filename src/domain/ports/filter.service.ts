import { Injectable } from '@nestjs/common'
import { SelectQueryBuilder } from 'typeorm'
import { FilterableConfig } from '../../common'

@Injectable()
export class FilterService {
    applyFilters(
        query: SelectQueryBuilder<any>,
        filters: Record<string, any>,
        filterableFields: FilterableConfig['filterableFields'] = []
    ): void {
        filterableFields.forEach((field) => {
            if (typeof field === 'string') {
                if (filters[field]) {
                    query.where(`entity.${field} = :${field}`, {
                        [field]: filters[field],
                    })
                }
            } else if (typeof field === 'object' && filters[field.key]) {
                field.handler(query, filters[field.key])
            }
        })
    }
}
