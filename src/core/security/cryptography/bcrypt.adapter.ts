import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

/*Адаптер для работы с библиотекой bcrypt.*/
@Injectable()
export class BcryptAdapter {
  /*Метод для генерации хеша пароля.*/
  public async generatePasswordHash(password: string): Promise<string> {
    /*Генерируем хеш-соль. В качестве параметра для генерации хеш-соли указываем количество раундов, что является
    степенью двойки.*/
    const salt: string = await bcrypt.genSalt(10);
    /*Хешируем пароль, используя хеш-соль.*/
    return bcrypt.hash(password, salt);
  }

  /*Метод для проверки валидности пароля по хешу.*/
  public async checkPasswordByHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
