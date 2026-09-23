import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*Гард для аутентификации по логину или email и паролю, используя библиотеку Passport.js.*/
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
