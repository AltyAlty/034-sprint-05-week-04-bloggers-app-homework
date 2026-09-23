/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке комментариев с пагинацией.*/
export enum CommentSortFieldQueryInputDTO {
  CreatedAt = 'createdAt',
  PostId = 'postId',
  Content = 'content',
}
