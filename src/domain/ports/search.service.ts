import { Injectable } from '@nestjs/common'
import { FilterableConfig } from '../../common'
import { SelectQueryBuilder } from 'typeorm'

@Injectable()
export class SearchService {
    applySearch(
        query: SelectQueryBuilder<any>,
        search: string,
        searchableFields: FilterableConfig['searchableFields'] = []
    ): void {
        searchableFields.forEach((field) => {
            if (search) {
                query.orWhere(`LOWER(entity.${field}) LIKE LOWER(:${field})`, {
                    [field]: `%${search}%`,
                })
            }
        })
    }
}
