import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { Argon2Adapter } from '../../../../core/security/cryptography/argon2.adapter';
import { UsersPostgresqlService } from '../users/users-postgresql.service';
import { AuthPostgresqlRepository } from '../../infrastructure/auth/auth-postgresql.repository';
import { SecurityDevicesPostgresqlRepository } from '../../infrastructure/security-devices/security-devices-postgresql.repository';
import { UsersPostgresqlRepository } from '../../infrastructure/users/users-postgresql.repository';
import { EmailConfirmationPostgresqlDb } from '../../infrastructure/auth/postgresql-types/email-confirmation-postgresql-db.type';
import { PasswordRecoveryCodeDataPostgresqlDb } from '../../infrastructure/auth/postgresql-types/password-recovery-code-data-postgresql-db.type';
import { SessionPostgresqlDb } from '../../infrastructure/auth/postgresql-types/session-postgresql-db.type';
import { SecurityDevicePostgresqlDb } from '../../infrastructure/security-devices/postgresql-types/security-device-postgresql-db.type';
import { UserPostgresqlDb } from '../../infrastructure/users/postgresql-types/user-postgresql-db.type';
import { DomainException, DomainExceptionCode } from '../../../../core/exceptions/domain/domain.exception';
import { UserLocalAuthContextDTO } from '../../../../core/guards/local-auth/dto/user-local-auth-context.dto';
import { UserRefreshJwtAuthContextDTO } from '../../../../core/guards/refresh-jwt-auth/dto/user-refresh-jwt-auth-context.dto';
import { EmailManager } from '../../../../core/modules/notification/email-manager/email.manager';
import { UserAgentAndIpDTO } from '../../api/auth/decorators/param-extraction/dto/user-agent-and-ip.dto';
import { AuthConfig } from '../../config/auth.config';
import { ConfirmUserByCodeDTO } from './dto/confirm-user-by-code.dto';
import { RegisterUserDTO } from './dto/register-user.dto';
import { ResendConfirmationEmailDTO } from './dto/resend-confirmation-email.dto';
import { SendPasswordRecoveryCodeDTO } from './dto/send-password-recovery-code.dto';
import { UpdatePasswordByPasswordRecoveryCodeDTO } from './dto/update-password-by-password-recovery-code.dto';
import { UserTokensDataDTO } from './dto/user-tokens-data.dto';
import { ValidateAccessJwtPayloadDTO } from './dto/validate-access-jwt-payload.dto';
import { ValidateRefreshJwtPayloadDTO } from './dto/validate-refresh-jwt-payload.dto';
import { ValidateUserLocalAuthCredentialsDTO } from './dto/validate-user-local-auth-credentials.dto';

/*Сервис для работы с аутентификацией и авторизацией в PostgreSQL.*/
@Injectable()
export class AuthPostgresqlService {
  public constructor(
    private readonly authConfig: AuthConfig,
    private readonly jwtService: JwtService,
    private readonly argon2Adapter: Argon2Adapter,
    private readonly emailManager: EmailManager,
    private readonly usersService: UsersPostgresqlService,
    private readonly authRepository: AuthPostgresqlRepository,
    private readonly securityDevicesRepository: SecurityDevicesPostgresqlRepository,
    private readonly usersRepository: UsersPostgresqlRepository
  ) {}

  /*Метод для регистрации пользователя.*/
  public async registerUser(dto: RegisterUserDTO): Promise<void> {
    /*Просим сервис "UsersService" создать пользователя.*/
    const userId: string = await this.usersService.create(dto);
    /*Генерируем код подтверждения регистрации пользователя.*/
    const confirmationCode: string = randomUUID();

    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим репозиторий "AuthRepository" создать данные о подтверждении регистрации пользователя в БД.*/
    await this.authRepository.createEmailConfirmation({ userId, confirmationCode, expirationDate });

    /*Просим менеджер "EmailManager" отправить письмо о подтверждении регистрации пользователя. Если использовать здесь
    ключевое слово await, то при ошибке во время отправки письма будет происходить следующее:
    1. Пользователь успешно сохраняется в БД.
    2. Код подтверждения регистрации пользователя успешно сохраняется в БД.
    3. Во время попытки отправить письмо клиенту происходит ошибка.
    4. Клиенту возвращается 500 ответ.
    5. Клиент думает, что регистрация не прошла и пробует зарегистрироваться еще раз.
    6. Клиент повторно вводит тот же email и получает 400 ответ, так как такой email уже занят.
    7. Пользователь оказывается в замешательстве, не понимая, что ему нужно повторно запросить код подтверждения
    регистрации, а не пытаться зарегистрироваться заново.

    Если нужно использовать здесь ключевое слово await, то операцию нужно делать в виде транзакции.*/
    this.emailManager
      .sendCompleteRegistrationEmail(dto.email, confirmationCode)
      .catch((error: any): void => console.error('Failed to send a complete registration email: ', error));
  }

  /*Метод для повторной отправки письма для подтверждения регистрации пользователя.*/
  public async resendConfirmationEmail(dto: ResendConfirmationEmailDTO): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findByEmail(dto.email);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileResendingConfirmationEmail,
        message: 'User to confirm not found',
        field: 'email',
      });

    /*Если регистрация пользователя уже была подтверждена, то выбрасываем исключение с информацией об этом.*/
    if (user.is_confirmed)
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmedUserRegistration,
        message: 'Registration has already been confirmed',
        field: 'email',
      });

    /*Получаем ID пользователя.*/
    const userId: string = user.id;
    /*Если регистрация пользователя еще не была подтверждена, то генерируем код подтверждения регистрации
    пользователя.*/
    const confirmationCode: string = randomUUID();

    /*Генерируем дату истечения кода подтверждения регистрации пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим репозиторий "AuthRepository" найти данные о подтверждении регистрации пользователя по ID пользователя в
    БД.*/
    const emailConfirmation: EmailConfirmationPostgresqlDb | null =
      await this.authRepository.findEmailConfirmationByUserId(userId);

    /*Если данные о подтверждении регистрации пользователя были найдены, то просим репозиторий "AuthRepository" изменить
    их по ID пользователя в БД.*/
    if (emailConfirmation) {
      await this.authRepository.updateEmailConfirmationByUserId(userId, { confirmationCode, expirationDate });
    } else {
      /*Если данные о подтверждении регистрации пользователя не были найдены, то просим репозиторий "AuthRepository"
      создать такие данные в БД.*/
      await this.authRepository.createEmailConfirmation({ userId, confirmationCode, expirationDate });
    }

    /*Просим менеджер "EmailManager" повторно отправить письмо о подтверждении регистрации пользователя.*/
    this.emailManager
      .sendCompleteRegistrationEmail(dto.email, confirmationCode)
      .catch((error: any): void => console.error('Failed to resend a complete registration email: ', error));
  }

  /*Метод для подтверждения регистрации пользователя по коду подтверждения регистрации пользователя.*/
  public async confirmByCode(dto: ConfirmUserByCodeDTO): Promise<void> {
    /*Просим репозиторий "AuthRepository" найти данные о подтверждении регистрации пользователя по коду подтверждения
    регистрации пользователя.*/
    const emailConfirmation: EmailConfirmationPostgresqlDb | null =
      await this.authRepository.findEmailConfirmationByCode(dto.code);

    /*Если данные о подтверждении регистрации пользователя не были найдены, то выбрасываем исключение с информацией об
    этом.*/
    if (!emailConfirmation)
      throw new DomainException({
        code: DomainExceptionCode.InvalidUserRegistrationConfirmationCode,
        message: 'Confirmation code is invalid',
        field: 'code',
      });

    /*Если срок действия кода подтверждения регистрации пользователя истек, то выбрасываем исключение с информацией об
    этом.*/
    if (emailConfirmation.expiration_date <= new Date())
      throw new DomainException({
        code: DomainExceptionCode.ExpiredUserRegistrationConfirmationCode,
        message: 'Confirmation code is expired',
        field: 'code',
      });

    /*Если данные о подтверждении регистрации пользователя были найдены и срок действия кода подтверждения регистрации
    пользователя не истек, то получаем ID пользователя.*/
    const userId: string = emailConfirmation.user_id;
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findById(userId);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhileRegistrationConfirmation,
        message: 'User to confirm registration not found',
        field: 'id',
      });

    /*Если регистрация пользователя уже была подтверждена, то выбрасываем исключение с информацией об этом.*/
    if (user.is_confirmed)
      throw new DomainException({
        code: DomainExceptionCode.AlreadyConfirmedUserRegistration,
        message: 'Registration has already been confirmed',
        field: 'code',
      });

    /*Если пользователь был найден и его регистрация еще не была подтверждена, то просим репозиторий "UsersRepository"
    подтвердить регистрацию пользователя по ID пользователя в БД.*/
    await this.usersRepository.confirmUserById(userId);
    /*Просим репозиторий "AuthRepository" удалить все данные о подтверждении регистрации пользователя по ID пользователя
    в БД.*/
    await this.authRepository.deleteAllEmailConfirmationsByUserId(userId);
  }

  /*Метод для отправки письма с кодом восстановления пароля пользователя.*/
  public async sendPasswordRecoveryCode(dto: SendPasswordRecoveryCodeDTO): Promise<void> {
    /*Просим репозиторий "UsersRepository" найти пользователя по email в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findByEmail(dto.email);
    /*Если пользователь не был найден, то завершаем работу метода, чтобы не возвращать ошибку клиенту.*/
    if (!user) return;
    /*Если пользователь был найден, то получаем ID пользователя.*/
    const userId: string = user.id;
    /*Генерируем код восстановления пароля пользователя.*/
    const passwordRecoveryCode: string = randomUUID();

    /*Генерируем дату истечения кода восстановления пароля пользователя.*/
    const expirationDate: Date = add(new Date(), {
      minutes: this.authConfig.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_MINUTES,
    });

    /*Просим репозиторий "AuthRepository" найти данные о коде восстановления пароля пользователя по ID пользователя в
    БД.*/
    const passwordRecoveryCodeData: PasswordRecoveryCodeDataPostgresqlDb | null =
      await this.authRepository.findRecoveryPasswordCodeDataByUserId(userId);

    /*Если данные о коде восстановления пароля пользователя были найдены, то просим репозиторий "AuthRepository"
    изменить их по ID пользователя в БД.*/
    if (passwordRecoveryCodeData) {
      await this.authRepository.updatePasswordRecoveryCodeDataByUserId(userId, {
        passwordRecoveryCode,
        expirationDate,
      });
    } else {
      /*Если данные о коде восстановления пароля пользователя не были найдены, то просим репозиторий "AuthRepository"
      создать такие данные в БД.*/
      await this.authRepository.createPasswordRecoveryCodeData({ userId, passwordRecoveryCode, expirationDate });
    }

    /*Просим менеджер "EmailManager" отправить письмо с кодом восстановления пароля пользователя.*/
    this.emailManager
      .sendPasswordRecoveryEmail(dto.email, passwordRecoveryCode)
      .catch((error: any): void => console.error('Failed to send a recovery password email: ', error));
  }

  /*Метод для изменения пароля пользователя по коду восстановления пароля пользователя.*/
  public async updatePasswordByPasswordRecoveryCode(dto: UpdatePasswordByPasswordRecoveryCodeDTO): Promise<void> {
    /*Просим репозиторий "AuthRepository" найти данные о коде восстановления пароля пользователя по коду восстановления
    пароля пользователя в БД.*/
    const passwordRecoveryCodeData: PasswordRecoveryCodeDataPostgresqlDb | null =
      await this.authRepository.findRecoveryPasswordCodeDataByPasswordRecoveryCode(dto.recoveryCode);

    /*Если данные о коде восстановления пароля пользователя не были найдены, то выбрасываем исключение с информацией об
    этом.*/
    if (!passwordRecoveryCodeData)
      throw new DomainException({
        code: DomainExceptionCode.InvalidPasswordRecoveryCode,
        message: 'Password recovery code is invalid',
        field: 'recoveryCode',
      });

    /*Если срок действия кода восстановления пароля пользователя истек, то выбрасываем исключение с информацией об
    этом.*/
    if (passwordRecoveryCodeData.expiration_date <= new Date())
      throw new DomainException({
        code: DomainExceptionCode.ExpiredPasswordRecoveryCode,
        message: 'Password recovery code is expired',
        field: 'recoveryCode',
      });

    /*Если данные о коде восстановления пароля пользователя были найдены, то получаем ID пользователя.*/
    const userId: string = passwordRecoveryCodeData.user_id;
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findById(userId);

    /*Если пользователь не был найден, то выбрасываем исключение с информацией об этом.*/
    if (!user)
      throw new DomainException({
        code: DomainExceptionCode.UserNotFoundWhilePasswordRecovery,
        message: 'User to recover password not found',
        field: 'code',
      });

    /*Если пользователь был найден, то просим адаптер "Argon2Adapter" сгенерировать хеш для пароля.*/
    const passwordHash: string = await this.argon2Adapter.generatePasswordHash(dto.password);
    /*Просим репозиторий "UsersRepository" изменить хеш для пароля пользователя по ID пользователя в БД.*/
    await this.usersRepository.updateUserPasswordHashById(userId, passwordHash);
    /*Просим репозиторий "AuthRepository" удалить данные о всех кодах восстановления пароля пользователя ID пользователя
    в БД.*/
    await this.authRepository.deleteAllRecoveryCodesDataByUserId(userId);
  }

  /*Метод для аутентификации пользователя.*/
  public async authUser(
    userLocalAuthContext: UserLocalAuthContextDTO,
    ipAndUserAgent: UserAgentAndIpDTO
  ): Promise<UserTokensDataDTO> {
    /*Получаем ID пользователя.*/
    const userId: string = userLocalAuthContext.id;
    /*Генерируем ID пользовательского устройства.*/
    const deviceId: string = randomUUID();
    /*Получаем значение заголовка "user-agent".*/
    const userAgent: string = ipAndUserAgent.userAgent;
    /*Получаем IP-адрес пользователя.*/
    const ip: string = ipAndUserAgent.ip;

    /*Просим сервис "JwtService" создать AT.*/
    const accessToken: string = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.authConfig.AT_SECRET,
        expiresIn: this.authConfig.AT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Просим сервис "JwtService" создать RT.*/
    const refreshToken: string = await this.jwtService.signAsync(
      { userId, deviceId },
      {
        secret: this.authConfig.RT_SECRET,
        expiresIn: this.authConfig.RT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Получаем payload из RT.*/
    const { iat: refreshTokenIat, exp: refreshTokenExp }: { iat: number; exp: number } =
      await this.jwtService.decode(refreshToken);

    /*Формируем даты создания и истечения RT.*/
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    const refreshTokenExpDate: Date = new Date(refreshTokenExp * 1000);

    /*Просим репозиторий "SecurityDevicesRepository" создать пользовательское устройство в БД.*/
    await this.securityDevicesRepository.create({
      deviceId,
      userId,
      title: userAgent,
      ip,
      lastActiveDate: refreshTokenIatDate,
    });

    /*Просим репозиторий "AuthRepository" создать сессию в БД.*/
    await this.authRepository.createSession({
      userId,
      deviceId,
      deviceName: userAgent,
      ip,
      iat: refreshTokenIatDate,
      exp: refreshTokenExpDate,
    });

    /*Возвращаем AT.*/
    return { accessToken, refreshToken };
  }

  /*Метод для создания новой пары AT и RT.*/
  public async getNewAccessAndRefreshTokens(
    userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO,
    ipAndUserAgent: UserAgentAndIpDTO
  ): Promise<UserTokensDataDTO> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Получаем значение заголовка "user-agent".*/
    const userAgent: string = ipAndUserAgent.userAgent;
    /*Получаем IP-адрес пользователя.*/
    const ip: string = ipAndUserAgent.ip;

    /*Просим сервис "JwtService" создать AT.*/
    const accessToken: string = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.authConfig.AT_SECRET,
        expiresIn: this.authConfig.AT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Просим сервис "JwtService" создать RT.*/
    const refreshToken: string = await this.jwtService.signAsync(
      { userId, deviceId },
      {
        secret: this.authConfig.RT_SECRET,
        expiresIn: this.authConfig.RT_TIME_IN_SECONDS as JwtSignOptions['expiresIn'],
      }
    );

    /*Получаем payload из RT.*/
    const { iat: refreshTokenIat, exp: refreshTokenExp }: { iat: number; exp: number } =
      await this.jwtService.decode(refreshToken);

    /*Формируем даты создания и истечения RT.*/
    const refreshTokenIatDate: Date = new Date(refreshTokenIat * 1000);
    const refreshTokenExpDate: Date = new Date(refreshTokenExp * 1000);

    /*Просим репозиторий "AuthRepository" изменить пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    await this.authRepository.updateSessionByUserIdAndDeviceIdAndIat(userId, deviceId, userRefreshJwtAuthContext.iat, {
      deviceName: userAgent,
      ip,
      iat: refreshTokenIatDate,
      exp: refreshTokenExpDate,
    });

    /*Просим репозиторий "SecurityDevicesRepository" изменить пользовательское устройство по ID в БД.*/
    await this.securityDevicesRepository.updateById(deviceId, {
      title: userAgent,
      ip,
      lastActiveDate: refreshTokenIatDate,
    });

    /*Возвращаем AT.*/
    return { accessToken, refreshToken };
  }

  /*Метод для отзыва пользовательской сессии.*/
  public async revokeSession(userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO): Promise<void> {
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Просим репозиторий "AuthRepository" удалить пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    await this.authRepository.deleteSessionByUserIdAndDeviceIdAndIat(
      userRefreshJwtAuthContext.id,
      deviceId,
      userRefreshJwtAuthContext.iat
    );

    /*Просим репозиторий "SecurityDevicesRepository" удалить пользовательское устройство по ID в БД.*/
    await this.securityDevicesRepository.deleteById(deviceId);
  }

  /*Метод для отзыва пользовательской сессии по ID пользовательского устройства.*/
  public async revokeSessionBySecurityDeviceId(
    deviceId: string,
    userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;

    /*Просим репозиторий "SecurityDevicesRepository" найти пользовательское устройство по ID в БД.*/
    const securityDevice: SecurityDevicePostgresqlDb | null = await this.securityDevicesRepository.findById(deviceId);

    /*Если пользовательское устройство не было найдено, то выбрасываем исключение с информацией об этом.*/
    if (!securityDevice)
      throw new DomainException({
        code: DomainExceptionCode.SecurityDeviceNotfoundWhileRevokingSessionBySecurityDeviceId,
        message: 'Security device to revoke a session not found',
        field: 'id',
      });

    /*Если пользователь не является владельцем пользовательского устройства, то выбрасываем исключение с информацией об
    этом.*/
    if (securityDevice.user_id !== userId)
      throw new DomainException({
        code: DomainExceptionCode.WrongSecurityDeviceOwnerWhileRevokingSessionBySecurityDeviceId,
        message: 'The user is not the owner of the security device to revoke a session',
        field: 'id',
      });

    /*Если пользователь является владельцем пользовательского устройства, то просим репозиторий "AuthRepository" удалить
    пользовательскую сессию по ID пользователя, ID пользовательского устройства и дате выдачи RT в БД.*/
    await this.authRepository.deleteSessionByUserIdAndDeviceIdAndIat(userId, deviceId, userRefreshJwtAuthContext.iat);
    /*Просим репозиторий "SecurityDevicesRepository" удалить пользовательское устройство по ID в БД.*/
    await this.securityDevicesRepository.deleteById(deviceId);
  }

  /*Метод для отзыва всех пользовательских сессий, кроме текущей.*/
  public async revokeAllSessionsExceptCurrentOne(
    userRefreshJwtAuthContext: UserRefreshJwtAuthContextDTO
  ): Promise<void> {
    /*Получаем ID пользователя.*/
    const userId: string = userRefreshJwtAuthContext.id;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = userRefreshJwtAuthContext.deviceId;
    /*Просим репозиторий "AuthRepository" удалить все пользовательские сессии по ID пользователя и ID пользовательского
    устройства в БД.*/
    await this.authRepository.deleteAllSessionsExceptCurrentOneByUserIdAndSecurityDeviceId(userId, deviceId);
    /*Просим репозиторий "SecurityDevicesRepository" удалить все пользовательские устройства, кроме текущего, по ID
    пользовательского устройства и ID пользователя в БД.*/
    await this.securityDevicesRepository.deleteAllExceptCurrentOneBySecurityDeviceIdAndUserId(deviceId, userId);
  }

  /*Метод для валидации учетных данных пользователя при аутентификации по логину или email и паролю.*/
  public async validateUserLocalAuthCredentials(
    dto: ValidateUserLocalAuthCredentialsDTO
  ): Promise<UserLocalAuthContextDTO | null> {
    /*Просим репозиторий "UsersRepository" найти пользователя по логину или email в БД.*/
    const user: UserPostgresqlDb | null = await this.usersRepository.findByLoginOrEmail(dto.loginOrEmail);
    /*Если пользователь не был найден, то возвращаем null.*/
    if (!user) return null;
    /*Если у пользователя не была подтверждена регистрация, то возвращаем null.*/
    if (!user.is_confirmed) return null;
    /*Если пользователь был найден и его регистрация подтверждена, то просим адаптер "Argon2Adapter" валидировать
    пароль.*/
    const isPasswordValid: boolean = await this.argon2Adapter.checkPasswordByHash(dto.password, user.password_hash);
    /*Если пароль оказался невалидным, то возвращаем null.*/
    if (!isPasswordValid) return null;
    /*Если пароль оказался валидным, то возвращаем ID пользователя.*/
    return { id: user.id.toString() };
  }

  /*Метод для валидации payload из Access JWT.*/
  public async validateAccessJwtPayload(dto: ValidateAccessJwtPayloadDTO): Promise<UserPostgresqlDb | null> {
    /*Просим репозиторий "UsersRepository" найти пользователя по ID в БД.*/
    return await this.usersRepository.findById(dto.userId);
  }

  /*Метод для валидации payload из Refresh JWT.*/
  public async validateRefreshJwtPayload(dto: ValidateRefreshJwtPayloadDTO): Promise<UserPostgresqlDb | null> {
    /*Получаем ID пользователя.*/
    const userId: string = dto.userId;
    /*Получаем ID пользовательского устройства.*/
    const deviceId: string = dto.deviceId;

    /*Просим репозиторий "AuthRepository" найти пользовательскую сессию по ID пользователя, ID пользовательского
    устройства и дате выдачи RT в БД.*/
    const session: SessionPostgresqlDb | null = await this.authRepository.findSessionByUserIdAndDeviceIdAndIat(
      userId,
      deviceId,
      new Date(dto.iat * 1000)
    );

    /*Если пользовательская сессия не была найдена, то возвращаем null.*/
    if (!session) return null;
    /*Если пользовательская сессия была найдена, то просим репозиторий "SecurityDevicesRepository" найти
    пользовательское устройство по ID в БД.*/
    const securityDevice: SecurityDevicePostgresqlDb | null = await this.securityDevicesRepository.findById(deviceId);
    /*Если пользовательское устройство не было найдено, то возвращаем null.*/
    if (!securityDevice) return null;
    /*Если пользовательская сессия и пользовательское устройство были найдены, то просим репозиторий "UsersRepository"
    найти пользователя по ID в БД.*/
    return await this.usersRepository.findById(userId);
  }
}
