/*DTO для валидации payload из Refresh JWT.*/
export class ValidateRefreshJwtPayloadDTO {
  userId: string;
  deviceId: string;
  iat: number;
  exp: number;
}
