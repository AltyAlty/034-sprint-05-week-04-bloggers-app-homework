import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configModule } from './config.module';
import { CoreConfig, Environments } from './core/config/core.config';
import { CoreModule } from './core/core.module';
import { DomainExceptionFilter } from './core/exception-filters/domain/domain.exception-filter';
import { BlogModule } from './modules/blog/blog.module';
import { UserModule } from './modules/user/user.module';
import { TestingModule } from './testing/testing.module';

/*Главный обязательный модуль приложения.*/
@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => ({
        type: coreConfig.POSTGRESQL_DB_TYPE as 'postgres',
        host: coreConfig.POSTGRESQL_DB_HOST,
        port: coreConfig.POSTGRESQL_DB_PORT,
        username: coreConfig.POSTGRESQL_DB_USERNAME,
        password: coreConfig.POSTGRESQL_DB_PASSWORD,
        database: coreConfig.DB_NAME,
        /*Автоматически регистрируем все сущности, которые были добавлены через "TypeOrmModule.forFeature()" в модулях
        приложения, иначе пришлось бы вручную перечислять все сущности в массиве "entities".*/
        autoLoadEntities: false,
        /*Указываем, чтобы при каждом запуске приложения TypeORM автоматически сравнивал сущности с реальными таблицами
        в БД и синхронизировал структуру.*/
        synchronize: false,
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [CoreModule],
      inject: [CoreConfig],
      useFactory: (coreConfig: CoreConfig) => [
        { ttl: coreConfig.REQUEST_RATE_LIMIT_TTL * 1000, limit: coreConfig.REQUEST_RATE_LIMIT },
      ],
    }),
    BlogModule,
    UserModule,
    /*Используем здесь "process.env.NODE_ENV", а не класс "CoreConfig", так как массив "imports" формируется синхронно
    до запуска DI-контейнера и класс "CoreConfig" еще не является созданным на этом этапе, но при это переменная
    "process.env.NODE_ENV" уже является доступной, поскольку она задается через команду в терминале.*/
    ...(process.env.NODE_ENV !== Environments.PRODUCTION ? [TestingModule] : []),
  ],
  controllers: [AppController],
  /*Регистрация глобального фильтра исключений "DomainExceptionFilter".*/
  providers: [AppService, { provide: APP_FILTER, useClass: DomainExceptionFilter }],
})
export class AppModule {}
