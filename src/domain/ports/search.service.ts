import { Injectable } from '@nestjs/common'
import { FilterableConfig } from '../../common'
import { SelectQueryBuilder, getMetadataArgsStorage } from 'typeorm'

@Injectable()
export class SearchService {
    applySearch(
        query: SelectQueryBuilder<any>,
        search: string,
        searchableFields: FilterableConfig['searchableFields'] = [],
        entity: any
    ): void {
        const columns = getMetadataArgsStorage().columns.filter((col) => col.target === entity);
        const relations = getMetadataArgsStorage().relations.filter((rel) => rel.target === entity);

        if (!search) {
            return;
        }

        const searchConditions: string[] = [];
        const searchParameters: Record<string, any> = {};

        searchableFields.forEach((field) => {
            const { alias, fieldName, columnType } = this.getFieldInfo(field, columns, relations);

            let shouldCastToTextForLike = true; // Default to true for safety
            let isCaseInsensitiveStringField = false;

            if (columnType) {
                if (typeof columnType === 'function') {
                    // If it's a JS constructor like String or Number
                    // Only apply LOWER for String, otherwise cast to TEXT
                    if (columnType === String) {
                        shouldCastToTextForLike = false;
                        isCaseInsensitiveStringField = true;
                    } else {
                        shouldCastToTextForLike = true; // e.g., for Number, Boolean
                    }
                } else if (typeof columnType === 'string') {
                    const lowerCaseColumnType = columnType.toLowerCase();
                    // Identify known string types that don't need casting to text, but might need LOWER()
                    if (['varchar', 'text', 'uuid'].includes(lowerCaseColumnType)) {
                        shouldCastToTextForLike = false; // It's already a text-like type
                        isCaseInsensitiveStringField = true; // And needs lowercasing
                    }
                    // For any other string type (e.g., database specific numeric types like 'integer', 'numeric', etc.),
                    // we will default to casting to TEXT as shouldCastToTextForLike remains true.
                }
            }

            const paramName = field.replace('.', '_'); // Create unique parameter name by replacing dot with underscore

            if (shouldCastToTextForLike) {
                // Cast to TEXT for LIKE comparison (for numeric, boolean, or unknown types)
                searchConditions.push(
                    `CAST(${alias}.${fieldName} AS TEXT) LIKE :${paramName}`
                );
            } else if (isCaseInsensitiveStringField) {
                // Apply LOWER for case-insensitive search on identified string types
                searchConditions.push(
                    `LOWER(${alias}.${fieldName}) LIKE LOWER(:${paramName})`
                );
            } else {
                // Fallback for other cases (should be rare with the current logic)
                searchConditions.push(
                    `${alias}.${fieldName} LIKE :${paramName}`
                );
            }
            searchParameters[paramName] = `%${search}%`;
        });

        if (searchConditions.length > 0) {
            query.andWhere(`(${searchConditions.join(' OR ')})`, searchParameters);
        }
    }

    private getFieldInfo(field: string, columns: any[], relations: any[]) {
        if (field.includes('.')) {
            const [relationName, relationField] = field.split('.');
            const relation = relations.find((rel) => rel.propertyName === relationName);
            if (relation) {
                const relationEntity = relation.type instanceof Function ? relation.type() : relation.type;
                const relationColumns = getMetadataArgsStorage().columns.filter((col) => col.target === relationEntity);
                const column = relationColumns.find((col) => col.propertyName === relationField);
                return {
                    alias: relationName,
                    fieldName: relationField,
                    columnType: column ? (column as any).type : undefined, // Return raw type
                };
            }
        }
        const column = columns.find((col) => col.propertyName === field);
        return {
            alias: 'entity',
            fieldName: field,
            columnType: column ? (column as any).type : undefined, // Return raw type
        };
    }
}