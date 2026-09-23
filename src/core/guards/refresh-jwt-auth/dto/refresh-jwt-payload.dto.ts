/*DTO для декодированного payload из Refresh JWT.*/
export class RefreshJwtPayloadDTO {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}
