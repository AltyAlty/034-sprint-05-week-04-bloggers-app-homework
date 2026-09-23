import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY: string = 'isPublic';
/*Декоратор, устанавливающий метаданные, которые указывают должна ли пропускаться проверка авторизации для контроллера
или метода контроллера.*/
export const Public = (): CustomDecorator<string> => SetMetadata(IS_PUBLIC_KEY, true);
