/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке блогов с пагинацией.*/
export enum BlogSortFieldQueryInputDTO {
  CreatedAt = 'createdAt',
  Name = 'name',
  Description = 'description',
  WebsiteUrl = 'websiteUrl',
}
