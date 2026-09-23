import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { PostSortFieldQueryInputDTO } from './post-sort-field-query.input-dto';

/*Input DTO для query-параметров при поиске постов.*/
export class GetPostListQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: PostSortFieldQueryInputDTO,
    default: PostSortFieldQueryInputDTO.CreatedAt,
    description: 'Term to sort by',
  })
  @IsEnum(PostSortFieldQueryInputDTO)
  @IsOptional()
  public sortBy: PostSortFieldQueryInputDTO = PostSortFieldQueryInputDTO.CreatedAt;
}
