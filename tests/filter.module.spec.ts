import { Test, TestingModule } from '@nestjs/testing'
import { FilterModule } from '../src/filter.module'
import { AppModule } from './mocks/app.module'
import { INestApplication } from '@nestjs/common'

describe('FilterModule', () => {
    let module: TestingModule
    let app: INestApplication

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = module.createNestApplication()
        await app.init()
    })

    it('should define the FilterModule', () => {
        const filterModule = module.get<FilterModule>(FilterModule)

        expect(filterModule).toBeDefined()
    })

    it('should register the GenericRepository', () => {
        const repository = module.get('GENERIC_REPOSITORY')

        expect(repository).toBeDefined()
    })

    afterEach(async () => {
        await app.close()
    })
})
