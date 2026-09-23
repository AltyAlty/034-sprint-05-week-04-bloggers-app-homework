import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { UsersPostgresqlService } from '../../application/users/users-postgresql.service';
import { UsersPostgresqlQueryService } from '../../application/users/users-postgresql.query-service';
import { CreateUserInputDTO } from './input-dto/create-user.input-dto';
import { GetUserListQueryInputDTO } from './input-dto/query/get-user-list-query.input-dto';
import { PaginationMetaDataOutputDTO } from '../../../../core/pagination/output-dto/pagination-meta-data.output-dto';
import { UserOutputDTO } from './output-dto/user.output-dto';
import { UserListOutputDTO } from './output-dto/user-list.output-dto';
import { BasicAuthGuard } from '../../../../core/guards/basic-auth/basic-auth.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { UsersControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/users-controller.swagger-decorators';

/*SA-контроллер для пользователей.*/
@ApiTags(SETTINGS.USERS_SA_API_TAG)
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller(SETTINGS.USERS_SA_PREFIX)
export class UsersSAController {
  public constructor(
    private readonly usersService: UsersPostgresqlService,
    private readonly usersQueryService: UsersPostgresqlQueryService
  ) {}

  /*001. POST-запрос по созданию пользователя.*/
  @UsersControllerSwaggerDecorators.createUser
  @Post(SETTINGS.USERS_SA_CREATE_USER_PATH)
  @HttpCode(HttpStatus.CREATED)
  public async createUser(@Body() body: CreateUserInputDTO): Promise<UserOutputDTO> {
    /*Просим сервис "UsersService" создать пользователя.*/
    return this.usersService.createConfirmedUser(body);
  }

  /*002. GET-запрос по поиску пользователей с пагинацией, используя query-параметры.*/
  @UsersControllerSwaggerDecorators.getUserList
  @Get(SETTINGS.USERS_SA_GET_USER_LIST_PATH)
  @HttpCode(HttpStatus.OK)
  public async getUserList(
    @Query() query: GetUserListQueryInputDTO
  ): Promise<PaginationMetaDataOutputDTO<UserListOutputDTO>> {
    /*Просим query-сервис "UsersQueryService" найти пользователей.*/
    return this.usersQueryService.findAll(query);
  }

  /*003. DELETE-запрос по удалению пользователя по ID, используя URI-параметры.*/
  @UsersControllerSwaggerDecorators.deleteUserById
  @Delete(SETTINGS.USERS_SA_DELETE_USER_BY_ID_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteUserById(@Param('id') id: string): Promise<void> {
    /*Просим сервис "UsersService" удалить пользователя по ID.*/
    await this.usersService.deleteById(id);
  }
}
