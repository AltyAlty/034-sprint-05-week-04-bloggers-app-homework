/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке постов с пагинацией.*/
export enum PostSortFieldQueryInputDTO {
  CreatedAt = 'createdAt',
  Title = 'title',
  ShortDescription = 'shortDescription',
  Content = 'content',
  BlogId = 'blogId',
  BlogName = 'blogName',
}
