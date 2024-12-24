import { plainToClass } from 'class-transformer'
import { QueryParamsDto } from '../src/adapters/api/dto/query-params.dto'

describe('QueryParamsDto', () => {
    it('should correctly parse filter parameters', () => {
        const queryParams: QueryParamsDto = plainToClass(QueryParamsDto, {
            filter: { name: 'Product A', price: 100 },
        })
        expect(queryParams.filter.name).toBe('Product A')
        expect(queryParams.filter.price).toBe(100)
    })

    it('should set default pagination values', () => {
        const queryParams: QueryParamsDto = plainToClass(QueryParamsDto, {})
        expect(queryParams.page).toBe(1)
        expect(queryParams.pageSize).toBe(10)
    })

    it('should override default pagination values if provided', () => {
        const queryParams: QueryParamsDto = plainToClass(QueryParamsDto, { page: 2, pageSize: 20 })
        expect(queryParams.page).toBe(2)
        expect(queryParams.pageSize).toBe(20)
    })
})
