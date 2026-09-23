/*DTO для валидации payload из Access JWT.*/
export class ValidateAccessJwtPayloadDTO {
  userId: string;
  iat: number;
  exp: number;
}
