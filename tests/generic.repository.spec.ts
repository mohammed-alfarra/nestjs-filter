import { GenericRepository } from '../src/adapters/database/generic.repository'
import { SearchService } from '../src/domain/ports/search.service'
import { FilterService } from '../src/domain/ports/filter.service'
import { SortService } from '../src/domain/ports/sort.service'
import { PaginationService } from '../src/domain/ports/pagination.service'
import { Reflector } from '@nestjs/core'
import { DataSource } from 'typeorm'
import { MockEntity } from './mocks/mock-entity.entity'
import { QueryParamsDto } from '../src/adapters/api/dto/query-params.dto'

describe('GenericRepository', () => {
    let genericRepository: GenericRepository<MockEntity>
    let searchService: SearchService
    let filterService: FilterService
    let sortService: SortService
    let paginationService: PaginationService
    let reflector: Reflector
    let mockQueryParams: QueryParamsDto

    const mockData: MockEntity[] = [
        { id: 1, name: 'test', price: 100 },
        { id: 2, name: 'test2', price: 200 },
    ]

    beforeEach(async () => {
        searchService = { applySearch: jest.fn() } as any
        filterService = { applyFilters: jest.fn() } as any
        sortService = { applySort: jest.fn() } as any
        paginationService = { applyPagination: jest.fn().mockResolvedValue({ meta: {}, links: {} }) } as any
        reflector = { get: jest.fn().mockReturnValue({}) } as any

        const dataSource = { manager: { transaction: jest.fn() } } as unknown as DataSource
        const entityManager = dataSource.manager

        genericRepository = new GenericRepository(
            searchService,
            filterService,
            sortService,
            paginationService,
            reflector,
            MockEntity,
            entityManager
        )

        mockQueryParams = {
            search: 'test',
            sortBy: 'name',
            sortOrder: 'ASC',
            page: 1,
            pageSize: 10,
        }
    })

    it('should be defined', () => {
        expect(genericRepository).toBeDefined()
    })

    it('should find all products without pagination', async () => {
        const findWithFiltersMock = jest.spyOn(genericRepository, 'findWithFilters')
        const getMock = jest.fn().mockResolvedValue(mockData)

        findWithFiltersMock.mockReturnValue({
            get: getMock,
        } as any)

        const result = await genericRepository.findWithFilters(mockQueryParams).get()

        expect(findWithFiltersMock).toHaveBeenCalledWith(mockQueryParams)
        expect(getMock).toHaveBeenCalled()
        expect(result).toEqual(mockData)
    })

    it('should find all products with pagination', async () => {
        const findWithFiltersMock = jest.spyOn(genericRepository, 'findWithFilters')
        const withPaginationMock = jest.fn().mockResolvedValue({
            data: mockData,
            meta: { totalCount: 2 },
            links: {},
        })

        findWithFiltersMock.mockReturnValue({
            withPagination: withPaginationMock,
        } as any)

        const result = await genericRepository
            .findWithFilters(mockQueryParams)
            .withPagination(mockQueryParams.page, mockQueryParams.pageSize)

        expect(findWithFiltersMock).toHaveBeenCalledWith(mockQueryParams)
        expect(withPaginationMock).toHaveBeenCalledWith(mockQueryParams.page, mockQueryParams.pageSize)
        expect(result.data).toEqual(mockData)
        expect(result.meta).toEqual({ totalCount: 2 })
    })
})
