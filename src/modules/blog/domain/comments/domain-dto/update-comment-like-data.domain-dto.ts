import { CommentLikeStatusDomainDTO } from './comment-like-status.domain-dto';

/*Domain DTO для изменения данных о лайке комментария.*/
export class UpdateCommentLikeDataDomainDTO {
  public likeStatus: CommentLikeStatusDomainDTO;
}
