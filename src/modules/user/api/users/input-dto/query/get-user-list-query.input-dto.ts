import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { UserSortFieldQueryInputDTO } from './user-sort-field-query.input-dto';
import { Trim } from '../../../../../../core/decorators/transformation/trim.transformation-decorator';

/*Input DTO для query-параметров при поиске пользователей.*/
export class GetUserListQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: UserSortFieldQueryInputDTO,
    default: UserSortFieldQueryInputDTO.CreatedAt,
    description: 'Term to sort by',
  })
  @IsEnum(UserSortFieldQueryInputDTO)
  @IsOptional()
  public sortBy: UserSortFieldQueryInputDTO = UserSortFieldQueryInputDTO.CreatedAt;

  @ApiPropertyOptional({ default: null, description: 'Term to search by' })
  @IsString()
  @Trim()
  @IsOptional()
  public searchLoginTerm: string | null = null;

  @ApiPropertyOptional({ default: null, description: 'Term to search by' })
  @IsString()
  @Trim()
  @IsOptional()
  public searchEmailTerm: string | null = null;
}
