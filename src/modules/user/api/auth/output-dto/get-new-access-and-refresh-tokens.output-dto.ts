import { ApiProperty } from '@nestjs/swagger';

/*Output DTO для получения новой пары AT и RT.*/
export class GetNewAccessAndRefreshTokensOutputDTO {
  @ApiProperty({ description: 'User Access JWT' })
  public accessToken: string;
}
