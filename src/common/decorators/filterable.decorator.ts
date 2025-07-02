import { SetMetadata } from '@nestjs/common'
import { SelectQueryBuilder } from 'typeorm'

export interface FilterableConfig {
    filterableFields?: (string | { key: string; handler: (query: SelectQueryBuilder<any>, value: any) => void })[]
    searchableFields?: string[]
    sortableFields?: string[]
    relationshipFields?: string[]
}

export function Filterable(config: FilterableConfig) {
    return SetMetadata('filterable', config)
}
