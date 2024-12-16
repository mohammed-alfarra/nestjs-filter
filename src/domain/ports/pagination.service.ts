import { Injectable } from '@nestjs/common'
import { SelectQueryBuilder } from 'typeorm'

@Injectable()
export class PaginationService {
    async applyPagination(
        query: SelectQueryBuilder<any>,
        page: number,
        pageSize: number
    ): Promise<{ meta: any; links: any }> {
        const totalItems = await query.getCount()

        const totalPages = Math.ceil(totalItems / pageSize)

        const meta = {
            pageSize,
            totalItems,
            page,
            totalPages,
        }

        const links = this.buildLinks(page, totalItems)

        return { meta, links }
    }

    private buildLinks(page: number, totalPages: number): any {
        const links: any = {}

        links.first = 1
        links.last = totalPages
        links.prev = page > 1 ? page - 1 : null
        links.next = page < totalPages ? page + 1 : null

        return links
    }
}
