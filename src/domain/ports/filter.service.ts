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
                    const values = this.parseFilterValues(filters[field])
                    if (values.length > 0) {
                        query.andWhere(`LOWER(entity.${field}) IN (:...${field})`, {
                            [field]: values.map(v => v.toLowerCase()),
                        })
                    }
                }
            } else if (typeof field === 'object' && filters[field.key]) {
                field.handler(query, filters[field.key])
            }
        })
    }

    private parseFilterValues(value: string): string[] {
        return value.split(',').map(v => v.trim()).filter(v => v.length > 0)
    }
}
