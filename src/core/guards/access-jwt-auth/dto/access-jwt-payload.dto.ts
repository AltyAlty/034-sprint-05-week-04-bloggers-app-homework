/*DTO для декодированного payload из Access JWT.*/
export class AccessJwtPayloadDTO {
  userId: string;
  iat: number;
  exp: number;
}
