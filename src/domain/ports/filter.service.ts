import { Injectable } from '@nestjs/common'
import { SelectQueryBuilder, getMetadataArgsStorage } from 'typeorm'
import { FilterableConfig } from '../../common'

@Injectable()
export class FilterService {
    applyFilters(
        query: SelectQueryBuilder<any>,
        filters: Record<string, any>,
        filterableFields: FilterableConfig['filterableFields'] = [],
        entity: any
    ): void {
        const columns = getMetadataArgsStorage().columns.filter((col) => col.target === entity);
        const relations = getMetadataArgsStorage().relations.filter((rel) => rel.target === entity);

        filterableFields.forEach((field) => {
            if (typeof field === 'string' && filters[field]) {
                const values = this.parseFilterValues(filters[field], field, columns, relations);
                if (values.length > 0) {
                    const { alias, fieldName, columnType } = this.getFieldInfo(field, columns, relations);
                    const isCaseInsensitive = ['varchar', 'text'].includes(columnType);
                    query.andWhere(
                        `${isCaseInsensitive ? `LOWER(${alias}.${fieldName})` : `${alias}.${fieldName}`} IN (:...${field.replace('.', '_')})`,
                        {
                            [field.replace('.', '_')]: isCaseInsensitive ? values.map((v: string) => v.toLowerCase()) : values,
                        }
                    );
                }
            } else if (typeof field === 'object' && filters[field.key]) {
                field.handler(query, filters[field.key]);
            }
        });
    }

    private getFieldInfo(field: string, columns: any[], relations: any[]) {
        if (field.includes('.')) {
            const [relationName, relationField] = field.split('.');
            const relation = relations.find((rel) => rel.propertyName === relationName);
            if (relation) {
                const relationEntity = relation.type instanceof Function ? relation.type : relation.type();
                const relationColumns = getMetadataArgsStorage().columns.filter((col) => col.target === relationEntity);
                const column = relationColumns.find((col) => col.propertyName === relationField);
                return {
                    alias: relationName,
                    fieldName: relationField,
                    columnType: column && 'type' in column ? String((column as any).type) : 'string',
                };
            }
        }
        const column = columns.find((col) => col.propertyName === field);
        return {
            alias: 'entity',
            fieldName: field,
            columnType: column && 'type' in column ? String((column as any).type) : 'string',
        };
    }

    private parseFilterValues(value: string, field: string, columns: any[], relations: any[]): any[] {
        const values = value.split(',').map((v) => v.trim()).filter((v) => v.length > 0);
        const columnType = this.getFieldInfo(field, columns, relations).columnType;
        if (['integer', 'numeric', 'int', 'float', 'double'].includes(columnType)) {
            return values
                .map((v) => Number(v))
                .filter((v) => !isNaN(v));
        }
        return values; // Strings for varchar, text, uuid, or unknown types
    }
}