import { Injectable } from '@nestjs/common'
import { FilterableConfig } from '../../common'
import { SelectQueryBuilder, getMetadataArgsStorage } from 'typeorm'

@Injectable()
export class SortService {
    applySort(
        query: SelectQueryBuilder<any>,
        sortBy: string,
        sortOrder: 'ASC' | 'DESC',
        sortableFields: FilterableConfig['sortableFields'] = []
    ): void {
        const mainAlias = query.expressionMap.mainAlias;
        const mainTarget = mainAlias?.target;

        if (!mainTarget) {
            return;
        }

        const columns = getMetadataArgsStorage().columns.filter((col) => col.target === mainTarget);
        const relations = getMetadataArgsStorage().relations.filter((rel) => rel.target === mainTarget);

        if (sortableFields.includes(sortBy)) {
            const { alias, fieldName } = this.getFieldInfo(sortBy, columns, relations);
            query.addOrderBy(`${alias}.${fieldName}`, sortOrder);
        }
    }

    private getFieldInfo(field: string, columns: any[], relations: any[]) {
        if (field.includes('.')) {
            const [relationName, relationField] = field.split('.');
            const relation = relations.find((rel) => rel.propertyName === relationName);
            if (relation) {
                return { alias: relationName, fieldName: relationField };
            }
        }
        return { alias: 'entity', fieldName: field };
    }
}