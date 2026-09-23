import { ApiProperty } from '@nestjs/swagger';
import { NewestPostLikeOutputDTO } from './newest-post-like.output-dto';
import { PostLikeStatusOutputDTO } from './post-like-status.output-dto';

/*Output DTO для данных о лайках поста.*/
export class ExtendedLikesInfoOutputDTO {
  @ApiProperty({ example: 100, description: 'Post likes count' })
  public likesCount: number;

  @ApiProperty({ example: 100, description: 'Post dislikes count' })
  public dislikesCount: number;

  @ApiProperty({ enum: PostLikeStatusOutputDTO, example: 'Like', description: 'Post user like status' })
  public myStatus: PostLikeStatusOutputDTO;

  @ApiProperty({
    type: () => NewestPostLikeOutputDTO,
    isArray: true,
    description: 'Last three post likes data',
  })
  /*Используем здесь класс, так как "NewestPostLikeListOutputDTO" - это обычный тип.*/
  public newestLikes: NewestPostLikeOutputDTO[];
}
