import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../../core/decorators/transformation/trim.transformation-decorator';

/*Тип для поля статуса лайка поста, которое приходит от клиента.*/
export enum PostLikeStatusInputDTO {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

/*Input DTO для изменения статуса лайка поста по ID поста с валидацией при помощи библиотеки class-validator.*/
export class UpdatePostLikeStatusByIdInputDTO {
  @ApiProperty({ enum: PostLikeStatusInputDTO, example: 'Like', description: 'New post like status' })
  @IsNotEmpty({ message: 'Field "$property" must not be empty' })
  @IsEnum(PostLikeStatusInputDTO, { message: `Field "$property" must be a 'Like', 'Dislike' or 'None'` })
  @Trim()
  public likeStatus: PostLikeStatusInputDTO;
}
