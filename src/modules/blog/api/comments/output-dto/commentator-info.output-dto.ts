import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для данных о комментаторе.*/
export class CommentatorInfoOutputDTO {
  @ApiProperty({ example: '60d5ec386f6e5a1b3c9d4e2a', description: 'ID of the user that liked the comment' })
  public userId: string;

  @ApiProperty({ example: 'userLogin', description: 'Login of the user that liked the comment' })
  public userLogin: string;
}
