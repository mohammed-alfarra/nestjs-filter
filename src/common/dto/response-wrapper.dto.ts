import { HttpStatus } from '@nestjs/common'

export class ResponseWrapper<T> {
    message?: string
    statusCode?: number
    data: T
    meta?: any
    links?: any

    constructor(response: T | { data: T; meta?: any; links?: any }, message = '', statusCode = HttpStatus.OK) {
        this.message = message
        this.statusCode = statusCode

        if (this.isPaginatedResponse(response)) {
            this.data = response.data
            this.meta = response.meta
            this.links = response.links
        } else {
            this.data = response
        }
    }

    private isPaginatedResponse(response: any): response is { data: T; meta?: any; links?: any } {
        return (
            response &&
            typeof response === 'object' &&
            'data' in response &&
            ('meta' in response || 'links' in response)
        )
    }
}
