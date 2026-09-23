import { ApiProperty } from '@nestjs/swagger';
import { CommentLikeStatusOutputDTO } from './comment-like-status.output-dto';

/*Output DTO для данных о лайках комментария.*/
export class LikesInfoOutputDTO {
  @ApiProperty({ example: 100, description: 'Comment likes count' })
  public likesCount: number;

  @ApiProperty({ example: 100, description: 'Comment dislikes count' })
  public dislikesCount: number;

  @ApiProperty({ enum: CommentLikeStatusOutputDTO, example: 'Like', description: 'Comment user like status' })
  public myStatus: CommentLikeStatusOutputDTO;
}
