import { PostLikeStatusDomainDTO } from './post-like-status.domain-dto';

/*Domain DTO для изменения данных о лайке поста.*/
export class UpdatePostLikeDataDomainDTO {
  public likeStatus: PostLikeStatusDomainDTO;
}
