import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

/*Менеджер для работы с библиотекой nodemailer. Подключается в модуле "NotificationModule".*/
@Injectable()
export class EmailManager {
  public constructor(private readonly mailerService: MailerService) {}

  /*Метод для отправки письма с кодом подтверждения регистрации пользователя.*/
  public async sendCompleteRegistrationEmail(email: string, code: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Complete your registration',
        html: `<h1>Thank you for your registration</h1>

               <p>To finish your registration please follow the link below:<br>
                 <a href='https://somesite.com/confirm-email?code=${code}'>Complete Registration</a>
               </p>`,
      });

      return true;
    } catch (error) {
      console.error('Error while trying to send a complete registration email:', error);
      return false;
    }
  }

  /*Метод для отправки письма с кодом восстановления пароля пользователя.*/
  public async sendPasswordRecoveryEmail(email: string, code: string): Promise<boolean> {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password recovery',
        html: `<h1>Password recovery</h1>

              <p>To recover your password please follow the link below:
                <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>Recover Password</a>
              </p>`,
      });

      return true;
    } catch (error) {
      console.error('Error while trying to send a password recovery email:', error);
      return false;
    }
  }
}
