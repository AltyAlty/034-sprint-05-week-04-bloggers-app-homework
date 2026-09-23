import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthPostgresqlService } from '../../application/auth/auth-postgresql.service';
import { UsersPostgresqlQueryService } from '../../application/users/users-postgresql.query-service';
import { AuthUserByLoginOrEmailInputDTO } from './input-dto/auth-user-by-login-or-email.input-dto';
import { ConfirmUserByCodeInputDTO } from './input-dto/confirm-user-by-code.input-dto';
import { RegisterUserInputDTO } from './input-dto/register-user.input-dto';
import { ResendConfirmationEmailInputDTO } from './input-dto/resend-confirmation-email.input-dto';
import { SendPasswordRecoveryCodeInputDTO } from './input-dto/send-password-recovery-code.input-dto';
import { SetNewPasswordByPasswordRecoveryCodeInputDTO } from './input-dto/set-new-password-by-password-recovery-code.input-dto';
import { AuthUserByLoginOrEmailOutputDTO } from './output-dto/auth-user-by-login-or-email.output-dto';
import { AuthUserDataOutputDTO } from './output-dto/auth-user-data.output-dto';
import { GetNewAccessAndRefreshTokensOutputDTO } from './output-dto/get-new-access-and-refresh-tokens.output-dto';
import { AccessJwtAuthGuard } from '../../../../core/guards/access-jwt-auth/access-jwt-auth.guard';
import { UserAccessJwtAuthContextDTO } from '../../../../core/guards/access-jwt-auth/dto/user-access-jwt-auth-context.dto';
import { IpAndUserAgentGuard } from '../../../../core/guards/ip-and-user-agent/ip-and-user-agent.guard';
import { UserLocalAuthContextDTO } from '../../../../core/guards/local-auth/dto/user-local-auth-context.dto';
import { LocalAuthGuard } from '../../../../core/guards/local-auth/local-auth.guard';
import { UserRefreshJwtAuthContextDTO } from '../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { RefreshJwtAuthGuard } from '../../../../core/guards/refresh-jwt-auth/refresh-jwt-auth.guard';
import { RequestRateLimitingGuard } from '../../../../core/guards/request-rate-limiting/request-rate-limiting.guard';
import { SETTINGS } from '../../../../core/settings/settings';
import { AuthControllerSwaggerDecorators } from '../../../../core/swagger/decorators/user-module/auth-controller.swagger-decorators';
import { UserAgentAndIpDTO } from './decorators/param-extraction/dto/user-agent-and-ip.dto';
import { ExtractIpAndUserAgentFromRequest } from './decorators/param-extraction/extract-ip-and-user-agent-from-request.param-decorator';
import { ExtractUserDataFromRequest } from './decorators/param-extraction/extract-user-data-from-request.param-decorator';

/*Контроллер для работы с аутентификацией и авторизацией.*/
@ApiTags(SETTINGS.AUTH_API_TAG)
@Controller(SETTINGS.AUTH_PREFIX)
export class AuthController {
  public constructor(
    private readonly authService: AuthPostgresqlService,
    private readonly usersQueryService: UsersPostgresqlQueryService
  ) {}

  /*001. POST-запрос по регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.registerUser
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_REGISTER_USER_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async registerUser(@Body() body: RegisterUserInputDTO): Promise<void> {
    /*Просим сервис "AuthService" зарегистрировать пользователя.*/
    await this.authService.registerUser(body);
  }

  /*002. POST-запрос по повторной отправке письма для подтверждения регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.resendConfirmationEmail
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_RESEND_CONFIRMATION_EMAIL_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resendConfirmationEmail(@Body() body: ResendConfirmationEmailInputDTO): Promise<void> {
    /*Просим сервис "AuthService" повторно отправить письмо для подтверждения регистрации пользователя.*/
    await this.authService.resendConfirmationEmail(body);
  }

  /*003. POST-запрос по подтверждению регистрации пользователя по коду подтверждения регистрации пользователя.*/
  @AuthControllerSwaggerDecorators.confirmUserByCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_CONFIRM_USER_BY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async confirmUserByCode(@Body() body: ConfirmUserByCodeInputDTO): Promise<void> {
    /*Просим сервис "AuthService" подтвердить регистрацию пользователя по коду подтверждения регистрации
    пользователя.*/
    await this.authService.confirmByCode(body);
  }

  /*004. POST-запрос по отправке письма с кодом восстановления пароля пользователя.*/
  @AuthControllerSwaggerDecorators.sendPasswordRecoveryCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_SEND_PASSWORD_RECOVERY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async sendPasswordRecoveryCode(@Body() body: SendPasswordRecoveryCodeInputDTO): Promise<void> {
    /*Просим сервис "AuthService" отправить письмо с кодом восстановления пароля пользователя.*/
    await this.authService.sendPasswordRecoveryCode(body);
  }

  /*005. POST-запрос по установлению нового пароля пользователя по коду восстановления пароля пользователя.*/
  @AuthControllerSwaggerDecorators.setNewPasswordByPasswordRecoveryCode
  @UseGuards(RequestRateLimitingGuard)
  @Post(SETTINGS.AUTH_SET_NEW_PASSWORD_BY_PASSWORD_RECOVERY_CODE_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async setNewPasswordByPasswordRecoveryCode(
    @Body() body: SetNewPasswordByPasswordRecoveryCodeInputDTO
  ): Promise<void> {
    /*Просим сервис "AuthService" установить новый пароль пользователя по коду восстановления пароля пользователя.*/
    await this.authService.updatePasswordByPasswordRecoveryCode(body);
  }

  /*006. POST-запрос по аутентификации пользователя по логину или email и паролю.*/
  @AuthControllerSwaggerDecorators.authUserByLoginOrEmail
  @UseGuards(IpAndUserAgentGuard, RequestRateLimitingGuard, LocalAuthGuard)
  @Post(SETTINGS.AUTH_AUTH_USER_BY_LOGIN_OR_EMAIL_PATH)
  @HttpCode(HttpStatus.OK)
  public async authUserByLoginOrEmail(
    @Body() body: AuthUserByLoginOrEmailInputDTO,
    @ExtractUserDataFromRequest() userLocalAuthContext: UserLocalAuthContextDTO,
    @ExtractIpAndUserAgentFromRequest() ipAndUserAgent: UserAgentAndIpDTO,
    @Res({ passthrough: true })
    res: Response
  ): Promise<AuthUserByLoginOrEmailOutputDTO> {
    /*Просим сервис "AuthService" аутентифицировать пользователя.*/
    const { accessToken, refreshToken }: { accessToken: string; refreshToken: string } =
      await this.authService.authUser(userLocalAuthContext, ipAndUserAgent);

    /*Отправляем RT клиенту через cookies, используя метод "res.cookie()" из Express.js.*/
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    /*Отправляем AT клиенту через тело ответа.*/
    return { accessToken };
  }

  /*007. POST-запрос по получению новой пары AT и RT.*/
  @AuthControllerSwaggerDecorators.getNewAccessAndRefreshTokens
  @UseGuards(IpAndUserAgentGuard, RefreshJwtAuthGuard)
  @Post(SETTINGS.AUTH_GET_NEW_ACCESS_AND_REFRESH_TOKENS_PATH)
  @HttpCode(HttpStatus.OK)
  public async getNewAccessAndRefreshTokens(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO,
    @ExtractIpAndUserAgentFromRequest() ipAndUserAgent: UserAgentAndIpDTO,
    @Res({ passthrough: true })
    res: Response
  ): Promise<GetNewAccessAndRefreshTokensOutputDTO> {
    /*Просим сервис "AuthService" создать новую пару AT и RT.*/
    const { accessToken, refreshToken }: { accessToken: string; refreshToken: string } =
      await this.authService.getNewAccessAndRefreshTokens(userRefreshJwtAuthContext, ipAndUserAgent);

    /*Отправляем RT клиенту через cookies, используя метод "res.cookie()" из Express.js.*/
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    /*Отправляем AT клиенту через тело ответа.*/
    return { accessToken };
  }

  /*008. POST-запрос по отзыву пользовательской сессии.*/
  @AuthControllerSwaggerDecorators.revokeSession
  @UseGuards(RefreshJwtAuthGuard)
  @Post(SETTINGS.AUTH_LOGOUT_PATH)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revokeSession(
    @ExtractUserDataFromRequest() userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Просим сервис "AuthService" отозвать сессию.*/
    await this.authService.revokeSession(userRefreshJwtAuthContext);
  }

  /*009. GET-запрос по получению данных пользователя по AT.*/
  @AuthControllerSwaggerDecorators.getAuthUserDataByAccessToken
  @UseGuards(AccessJwtAuthGuard)
  @Get(SETTINGS.AUTH_GET_USER_DATA_BY_ACCESS_TOKEN_PATH)
  @HttpCode(HttpStatus.OK)
  public async getAuthUserDataByAccessToken(
    @ExtractUserDataFromRequest() userAccessJwtAuthContext: UserAccessJwtAuthContextDTO
  ): Promise<AuthUserDataOutputDTO> {
    /*Просим сервис "UsersQueryService" найти данные о пользователе по ID пользователя при предоставлении AT.*/
    return this.usersQueryService.getAuthUserDataByUserId(userAccessJwtAuthContext.id);
  }
}
