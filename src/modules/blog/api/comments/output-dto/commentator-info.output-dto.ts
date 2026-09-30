import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для данных о комментаторе.*/
export class CommentatorInfoOutputDTO {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user that liked the comment',
  })
  public userId: string;

  @ApiProperty({ example: 'userLogin', description: 'Login of the user that liked the comment' })
  public userLogin: string;
}
