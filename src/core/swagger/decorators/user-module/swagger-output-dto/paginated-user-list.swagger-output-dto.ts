import { ApiProperty } from '@nestjs/swagger';
import { UserOutputDTO } from '../../../../../modules/user/api/users/output-dto/user.output-dto';
import { UserListOutputDTO } from '../../../../../modules/user/api/users/output-dto/user-list.output-dto';
import { PaginationMetaDataOutputDTO } from '../../../../pagination/output-dto/pagination-meta-data.output-dto';

/*Output DTO для списка пользователей с пагинацией для документации Swagger, так как для Swagger нужен именно класс, а
не просто тип.*/
export class PaginatedUserListSwaggerOutputDTO extends PaginationMetaDataOutputDTO<UserListOutputDTO> {
  @ApiProperty({ type: [UserOutputDTO] })
  public items: UserOutputDTO[];
}
