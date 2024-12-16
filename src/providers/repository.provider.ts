import { Provider } from '@nestjs/common'
import { EntityTarget, ObjectLiteral } from 'typeorm'
import { GenericRepository } from '../adapters'

export function GenericRepositoryProvider<T extends ObjectLiteral>(entity: EntityTarget<T>): Provider {
    return {
        provide: 'GENERIC_REPOSITORY',
        useFactory: (factory: <E extends ObjectLiteral>(entity: EntityTarget<E>) => GenericRepository<E>) =>
            factory(entity),
        inject: ['GENERIC_REPOSITORY_FACTORY'],
    }
}
