import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для аутентификации пользователя по логину или email и паролю.*/
export class AuthUserByLoginOrEmailOutputDTO {
  @ApiProperty({ description: 'User Access JWT' })
  public accessToken: string;
}
