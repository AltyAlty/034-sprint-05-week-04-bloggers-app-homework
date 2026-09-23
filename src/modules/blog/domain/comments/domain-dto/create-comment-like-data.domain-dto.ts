import { CommentLikeStatusDomainDTO } from './comment-like-status.domain-dto';

/*Domain DTO для создания данных о лайке комментария.*/
export class CreateCommentLikeDataDomainDTO {
  public commentId: string;
  public postId: string;
  public blogId: string;
  public userId: string;
  public likeStatus: CommentLikeStatusDomainDTO;
}
