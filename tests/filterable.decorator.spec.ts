import { Filterable } from '../src/common/decorators/filterable.decorator'

describe('@Filterable Decorator', () => {
    let MockEntity: any = class {}

    beforeEach(() => {
        Reflect.decorate(
            [
                Filterable({
                    filterableFields: [
                        'name',
                        {
                            key: 'price',
                            handler: (query: any, value: string) => query.andWhere('price = :price', { price: value }),
                        },
                    ],
                }),
            ],
            MockEntity
        )
    })

    it('should register filterable fields metadata for `name` and `price`', () => {
        const metadata = Reflect.getMetadata('filterable', MockEntity)

        expect(metadata).toEqual({
            filterableFields: [
                'name',
                {
                    key: 'price',
                    handler: expect.any(Function),
                },
            ],
        })
    })

    it('should register custom handler for `price` filterable field', () => {
        const metadata = Reflect.getMetadata('filterable', MockEntity)

        const priceHandler = metadata.filterableFields.find((field: any) => field.key === 'price')?.handler

        const mockQuery = { andWhere: jest.fn() }

        priceHandler(mockQuery, '100')

        expect(mockQuery.andWhere).toHaveBeenCalledWith('price = :price', { price: '100' })
    })
})
