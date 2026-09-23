/*Input DTO для разрешенных значений query-параметра "sortBy", используемого при сортировке пользователей с
пагинацией.*/
export enum UserSortFieldQueryInputDTO {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}
