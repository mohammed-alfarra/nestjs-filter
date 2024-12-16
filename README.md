# NestJS Filter

[![npm version](https://badge.fury.io/js/nestjs-filter.svg)](https://badge.fury.io/js/nestjs-filter) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**nestjs-filter** is an advanced and extensible library designed to facilitate robust filtering, searching, pagination, and sorting functionality for your NestJS projects. It empowers developers to implement sophisticated query-building mechanisms, adhering to modularity and reusability.

---

## Features

- **Easy Integration**: Quickly integrate with your NestJS services and controllers.
- **Seamless Integration**: Effortlessly incorporate filtering capabilities into your services and controllers. For example, integrating filtering in an e-commerce platform enables users to quickly narrow down product searches by attributes such as price, name, or availability, significantly enhancing the overall user experience.
- **Complex Query Handling**: Enables logical operators (`AND`, `OR`) for intricate filtering.
- **Built-in Pagination**: Supports paginated query results out of the box.
- **Dynamic Sorting**: Provides flexible sorting options for enhanced data organization.
- **Highly Customizable**: Offers extensibility to suit specific project requirements.
- **TypeScript Support**: Ensures type safety and an enhanced development experience.

---

## Installation

Install the package via npm or yarn:

```bash
npm install nestjs-filter
# or
yarn add nestjs-filter
```

---

## Getting Started

### 1. Add `@Filterable` Decorator to Your Entity

Define the fields available for filtering, sorting, and searching by applying the `@Filterable` decorator. By specifying these fields, you establish a clear and consistent structure for handling query parameters, ensuring both efficient data processing and a streamlined user experience. This approach enhances the flexibility of your filtering process while minimizing potential errors.

```typescript
import { Entity } from 'typeorm';
import { Filterable } from '@mohammedalfarra/nestjs-filter';

@Entity()
@Filterable({
    filterableFields: ['name', 'price'],
    searchableFields: ['name', 'description'],
    sortableFields: ['name', 'price', 'createdAt'],
})
export class Product {}
```

### 2. Register the Filter Module in Your Feature Module

Integrate the filter module in your desired module:

```typescript
import { Module } from '@nestjs/common';
import { Product } from './domain/model/product';
import { FilterModule } from '@mohammedalfarra/nestjs-filter';

@Module({
    imports: [FilterModule.forFeature(Product)],
})
export class ProductModule {}
```

### 3. Implement Filtering in Your Service

Utilize the filtering capabilities in your service. Be mindful of potential edge cases and limitations during implementation. For instance, complex filters involving multiple conditions or nested logical operations may require additional validation and testing to ensure accurate query resolution. Additionally, consider scenarios where input data does not match expected formats or field availability.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../model/product';
import { GenericRepository, QueryParamsDto } from '@mohammedalfarra/nestjs-filter';

@Injectable()
export class ProductService {
    constructor(
        @Inject('GENERIC_REPOSITORY')
        private readonly productRepository: GenericRepository<Product>
    ) {}

    async findAll(queryParams: QueryParamsDto): Promise<Product[]> {
        return await this.productRepository.findWithFilters(queryParams).get();
    }
}
```

### 4. Configure the Controller

Leverage the filtering logic in your controller to handle incoming requests:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from 'src/product/domain/ports/product.service';
import { Product } from 'src/product/domain/model/product';
import { QueryParamsDto, ResponseWrapper } from '@mohammedalfarra/nestjs-filter';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    async findAll(@Query() queryParams: QueryParamsDto): Promise<ResponseWrapper<Product[]>> {
        const products = await this.productService.findAll(queryParams);
        return new ResponseWrapper(products);
    }
}
```

---

## Advanced Usage

### Filtering

You can filter data using query parameters. For example:

- `?name=water` filters products by the name "water".
- `?name=water&price=120` filters products where the name is "water" and the price is 120.

### Search

Use the `search` parameter to perform a text-based search:

- `?search=water` searches for products with "water" in searchable fields.

### Sorting

Include sorting parameters to organize results. By default, the `sortOrder` is `ASC`:

- `?sortBy=name&sortOrder=ASC` sorts results by name in ascending order.
- `?sortBy=name&sortOrder=DESC` sorts results by name in descending order.

### Pagination

Pagination is enabled by default with the following parameters:

- `?page=1&pageSize=10` (default values if not specified).

You can customize the page and page size as needed.

### Custom Filters

Define custom filtering logic by creating filter handlers. For example:

`product.filters.ts`
```typescript
import { Product } from 'src/product/domain/model/product';
import { SelectQueryBuilder } from 'typeorm';

export const priceFilter = (query: SelectQueryBuilder<Product>, value: number) => {
    query.andWhere('entity.price = :price', { price: value });
};
```

Apply the custom filter in the `@Filterable` decorator:

```typescript
@Filterable({
    filterableFields: ['name', { key: 'price', handler: priceFilter }],
})
```

### Pagination

Include pagination parameters (`page`, `pageSize`) to enable paginated responses:

```typescript
async findAll(queryParams: QueryParamsDto): Promise<Product[]> {
    return await this.productRepository
        .findWithFilters(queryParams)
        .withPagination(queryParams.page, queryParams.pageSize);
}
```

Ensure `ResponseWrapper` is utilized in the controller to encapsulate paginated data:

```typescript
@Get()
async findAll(@Query() queryParams: QueryParamsDto): Promise<ResponseWrapper<Product[]>> {
    const products = await this.productService.findAll(queryParams);
    return new ResponseWrapper(products);
}
```

---

## Contributing

We welcome contributions to improve this package. Feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/mohammed-alfarra/nestjs-filter). To foster a consistent development approach, we encourage contributors to follow preferred coding practices, including clear code documentation, adherence to the existing style guide, and thorough testing of new features or fixes.

### Development Workflow

1. Clone the repository:

```bash
git clone https://github.com/mohammed-alfarra/nestjs-filter.git
```

2. Install dependencies:

```bash
npm install
```

3. Execute tests:

```bash
npm test
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

