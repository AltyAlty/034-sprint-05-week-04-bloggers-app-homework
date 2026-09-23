import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify, Version } from '@node-rs/argon2';

/*Адаптер для работы с библиотекой @node-rs/argon2.*/
@Injectable()
export class Argon2Adapter {
  /*Метод для генерации хеша пароля.*/
  public async generatePasswordHash(password: string): Promise<string> {
    return hash(password, {
      memoryCost: 65536,
      timeCost: 3,
      outputLen: 32,
      parallelism: 4,
      /*Опция "isolatedModules: true" в файле "tsconfig.json" конфликтует с ситуацией, когда в экспортируемых
      библиотеках настройки типизируют через enum. В данном случае можно:
      1. Убрать опцию "isolatedModules: true".
      2. Использовать стандартную библиотеку Argon2.
      3. Изменить код в текущей библиотеке для Argon2.
      4. Не указывать эти настройки, использую те, что по умолчанию.*/
      // algorithm: Algorithm.Argon2id,
      // version: Version.V0x13,
    });
  }

  /*Метод для проверки валидности пароля по хешу.*/
  public async checkPasswordByHash(password: string, hash: string): Promise<boolean> {
    return verify(hash, password);
  }
}
