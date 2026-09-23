import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './api/auth/auth.controller';
import { SecurityDevicesController } from './api/security-devices/security-devices.controller';
import { UsersSAController } from './api/users/users-sa.controller';
import { AuthService } from './application/auth/auth.service';
import { AuthPostgresqlService } from './application/auth/auth-postgresql.service';
import { UsersService } from './application/users/users.service';
import { UsersPostgresqlService } from './application/users/users-postgresql.service';
import { SecurityDevicesQueryService } from './application/security-devices/security-devices.query-service';
import { SecurityDevicesPostgresqlQueryService } from './application/security-devices/security-devices-postgresql.query-service';
import { UsersQueryService } from './application/users/users.query-service';
import { UsersPostgresqlQueryService } from './application/users/users-postgresql.query-service';
import { CommentsPostgresqlRepository } from '../blog/infrastructure/comments/comments-postgresql.repository';
import { AuthRepository } from './infrastructure/auth/auth.repository';
import { AuthPostgresqlRepository } from './infrastructure/auth/auth-postgresql.repository';
import { SecurityDevicesRepository } from './infrastructure/security-devices/security-devices.repository';
import { SecurityDevicesPostgresqlRepository } from './infrastructure/security-devices/security-devices-postgresql.repository';
import { UsersRepository } from './infrastructure/users/users.repository';
import { UsersPostgresqlRepository } from './infrastructure/users/users-postgresql.repository';
import { SecurityDevicesQueryRepository } from './infrastructure/security-devices/security-devices.query-repository';
import { SecurityDevicesPostgresqlQueryRepository } from './infrastructure/security-devices/security-devices-postgresql.query-repository';
import { UsersQueryRepository } from './infrastructure/users/users.query-repository';
import { UsersPostgresqlQueryRepository } from './infrastructure/users/users-postgresql.query-repository';
import { CoreModule } from '../../core/core.module';
import { AccessJwtAuthStrategy } from '../../core/guards/access-jwt-auth/access-jwt-auth.strategy';
import { LocalAuthStrategy } from '../../core/guards/local-auth/local-auth.strategy';
import { RefreshJwtAuthStrategy } from '../../core/guards/refresh-jwt-auth/refresh-jwt-auth.strategy';
import { Comment, CommentSchema } from '../blog/domain/comments/comment.entity';
import { CommentLikeData, CommentLikeDataSchema } from '../blog/domain/comments/comment-like-data.entity';
import { AuthConfig } from './config/auth.config';
import { AuthConfigModule } from './config/auth-config.module';
import { EmailConfirmation, EmailConfirmationSchema } from './domain/auth/email-confirmation.entity';
import {
  PasswordRecoveryCodeData,
  PasswordRecoveryCodeDataSchema,
} from './domain/auth/password-recovery-code-data.entity';
import { Session, SessionSchema } from './domain/auth/session.entity';
import { SecurityDevice, SecurityDeviceSchema } from './domain/security-devices/security-device.entity';
import { User, UserSchema } from './domain/users/user.entity';

/*Модуль для пользователей.*/
@Module({
  imports: [
    AuthConfigModule,
    CoreModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: PasswordRecoveryCodeData.name, schema: PasswordRecoveryCodeDataSchema },
      { name: Session.name, schema: SessionSchema },
      { name: SecurityDevice.name, schema: SecurityDeviceSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLikeData.name, schema: CommentLikeDataSchema },
    ]),
    /*Используем динамический модуль, чтобы можно было использовать класс "AuthConfig" для работы с переменными
    окружения.*/
    MongooseModule.forFeatureAsync([
      {
        imports: [AuthConfigModule],
        inject: [AuthConfig],
        name: EmailConfirmation.name,
        useFactory: (authConfig: AuthConfig) => {
          const schema = EmailConfirmationSchema;

          schema.index(
            { expirationDate: 1 },
            { expireAfterSeconds: authConfig.CONFIRMATION_REGISTRATION_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS }
          );

          return schema;
        },
      },
      {
        imports: [AuthConfigModule],
        inject: [AuthConfig],
        name: PasswordRecoveryCodeData.name,
        useFactory: (authConfig: AuthConfig) => {
          const schema = PasswordRecoveryCodeDataSchema;

          schema.index(
            { expirationDate: 1 },
            { expireAfterSeconds: authConfig.PASSWORD_RECOVERY_CODE_EXPIRATION_TIME_IN_DB_IN_SECONDS }
          );

          return schema;
        },
      },
    ]),
    PassportModule.register({ defaultStrategy: 'access-jwt' }),
  ],
  controllers: [AuthController, SecurityDevicesController, UsersSAController],
  providers: [
    LocalAuthStrategy,
    AccessJwtAuthStrategy,
    RefreshJwtAuthStrategy,
    JwtService,
    AuthService,
    AuthPostgresqlService,
    UsersService,
    UsersPostgresqlService,
    SecurityDevicesQueryService,
    SecurityDevicesPostgresqlQueryService,
    UsersQueryService,
    UsersPostgresqlQueryService,
    AuthRepository,
    AuthPostgresqlRepository,
    SecurityDevicesRepository,
    SecurityDevicesPostgresqlRepository,
    UsersRepository,
    UsersPostgresqlRepository,
    CommentsPostgresqlRepository,
    SecurityDevicesQueryRepository,
    SecurityDevicesPostgresqlQueryRepository,
    UsersQueryRepository,
    UsersPostgresqlQueryRepository,
  ],
  exports: [AuthConfigModule, AccessJwtAuthStrategy, AuthService, UsersService],
})
export class UserModule {}
