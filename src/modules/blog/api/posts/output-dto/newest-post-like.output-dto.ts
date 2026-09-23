import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для данных об одном из последних лайков поста.*/
export class NewestPostLikeOutputDTO {
  @ApiProperty({ example: '2026-08-28T04:16:49.315Z', description: 'Like creation date' })
  public addedAt: Date;

  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'ID of the user that liked the post' })
  public userId: string;

  @ApiProperty({ example: 'userLogin', description: 'Login of the user that liked the post' })
  public login: string;
}
