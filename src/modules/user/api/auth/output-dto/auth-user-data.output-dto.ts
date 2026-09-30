import { ApiProperty } from '@nestjs/swagger';
import { UserDb } from '../../../infrastructure/users/types/user-db.type';

/*Output DTO для получения данных пользователя при предоставлении AT.*/
export class AuthUserDataOutputDTO {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'User ID' })
  public userId: string;

  @ApiProperty({ example: 'userLogin', description: 'User login' })
  public login: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  public email: string;

  /*Маппер для преобразования пользователя из БД в подготовленные для отправки клиенту данные пользователя при
  предоставлении AT.*/
  public static mapFromUserDbToAuthUserDataOutputDTO(user: UserDb): AuthUserDataOutputDTO {
    const authUserDataOutputDTO: AuthUserDataOutputDTO = new AuthUserDataOutputDTO();
    authUserDataOutputDTO.userId = user.id.toString();
    authUserDataOutputDTO.login = user.login;
    authUserDataOutputDTO.email = user.email;
    return authUserDataOutputDTO;
  }
}
