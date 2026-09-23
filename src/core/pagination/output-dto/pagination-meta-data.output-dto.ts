import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для запросов списков с пагинацией. Сделан абстрактным, чтобы от него нельзя было создать экземпляр, но при
этом все еще можно было использовать как тип.*/
export abstract class PaginationMetaDataOutputDTO<T> {
  @ApiProperty({ example: 1, description: 'Page number' })
  public page: number;

  @ApiProperty({ example: 10, description: 'Page size' })
  public pageSize: number;

  @ApiProperty({ example: 100, description: 'Pages count' })
  public pagesCount: number;

  @ApiProperty({ example: 1000, description: 'Total items count' })
  public totalCount: number;

  @ApiProperty({ description: 'Paginated items' })
  public abstract items: T;

  /*Маппер для преобразования элементов списка в подготовленные для отправки клиенту с пагинацией элементы списка.*/
  public static mapToOutputDTO<T>(data: {
    page: number;
    pageSize: number;
    totalCount: number;
    items: T;
  }): PaginationMetaDataOutputDTO<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.pageSize),
      page: data.page,
      pageSize: data.pageSize,
      items: data.items,
    };
  }
}
