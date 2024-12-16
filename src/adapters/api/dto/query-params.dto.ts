import { Transform } from 'class-transformer'
import { IsOptional, IsString, IsEnum, IsInt, IsPositive } from 'class-validator'

export class QueryParamsDto {
    // filters
    [key: string]: any

    @IsOptional()
    @IsString()
    search?: string

    @IsOptional()
    @IsString()
    sortBy?: string

    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    sortOrder?: 'ASC' | 'DESC'

    @IsOptional()
    @Transform(({ value }) => Number(value), { toClassOnly: true })
    @IsInt()
    @IsPositive()
    page: number = 1

    @IsOptional()
    @Transform(({ value }) => Number(value), { toClassOnly: true })
    @IsInt()
    @IsPositive()
    pageSize: number = 10
}
