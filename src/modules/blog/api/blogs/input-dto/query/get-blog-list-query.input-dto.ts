import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DefaultPaginationSettingsInputDTO } from '../../../../../../core/pagination/input-dto/default-pagination-settings.input-dto';
import { BlogSortFieldQueryInputDTO } from './blog-sort-field-query.input-dto';
import { Trim } from '../../../../../../core/decorators/transformation/trim.transformation-decorator';

/*Input DTO для query-параметров при поиске блогов. Наследуется от класса "DefaultPaginationSettingsInputDTO", где
уже есть поля пагинации по умолчанию.*/
export class GetBlogListQueryInputDTO extends DefaultPaginationSettingsInputDTO {
  @ApiPropertyOptional({
    enum: BlogSortFieldQueryInputDTO,
    default: BlogSortFieldQueryInputDTO.CreatedAt,
    description: 'Term to sort by',
  })
  @IsEnum(BlogSortFieldQueryInputDTO)
  @IsOptional()
  public sortBy: BlogSortFieldQueryInputDTO = BlogSortFieldQueryInputDTO.CreatedAt;

  @ApiPropertyOptional({ default: null, description: 'Term to search by' })
  @IsString()
  @Trim()
  @IsOptional()
  public searchNameTerm: string | null = null;
}
