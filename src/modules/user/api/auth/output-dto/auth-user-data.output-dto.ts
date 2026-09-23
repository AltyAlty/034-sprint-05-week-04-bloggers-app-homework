import { ApiProperty } from '@nestjs/swagger';
import { UserPostgresqlDb } from '../../../infrastructure/users/postgresql-types/user-postgresql-db.type';
import { UserDocumentType } from '../../../domain/users/document-types/user.document-type';

/*Output DTO для получения данных пользователя при предоставлении AT.*/
export class AuthUserDataOutputDTO {
  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'User ID' })
  public userId: string;

  @ApiProperty({ example: 'userLogin', description: 'User login' })
  public login: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  public email: string;

  /*Маппер для преобразования пользователя из БД в подготовленные для отправки клиенту данные пользователя при
  предоставлении AT.*/
  public static mapFromUserDocumentTypeToAuthUserDataOutputDTO(user: UserDocumentType): AuthUserDataOutputDTO {
    const authUserDataOutputDTO: AuthUserDataOutputDTO = new AuthUserDataOutputDTO();
    authUserDataOutputDTO.userId = user._id.toString();
    authUserDataOutputDTO.login = user.login;
    authUserDataOutputDTO.email = user.email;
    return authUserDataOutputDTO;
  }

  /*Маппер для преобразования пользователя из БД в подготовленные для отправки клиенту данные пользователя при
  предоставлении AT.*/
  public static mapFromUserPostgresqlDbToAuthUserDataOutputDTO(user: UserPostgresqlDb): AuthUserDataOutputDTO {
    const authUserDataOutputDTO: AuthUserDataOutputDTO = new AuthUserDataOutputDTO();
    authUserDataOutputDTO.userId = user.id.toString();
    authUserDataOutputDTO.login = user.login;
    authUserDataOutputDTO.email = user.email;
    return authUserDataOutputDTO;
  }
}
