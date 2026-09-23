/*Утилита для нормализации email домена Google.*/
export const normalizeEmail = (email: string): string => {
  /*Приводим email к нижнему регистру.*/
  let [localPart, domain] = email.toLowerCase().split('@');

  /*Обрабатываем только домены Google.*/
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    /*Отрезаем все, что после плюса.*/
    localPart = localPart.split('+')[0];
    /*Удаляем все точки из локальной части.*/
    localPart = localPart.replace(/\./g, '');
    /*Приводим "googlemail.com" к "gmail.com".*/
    domain = 'gmail.com';
  }

  /*Собираем и возвращаем нормализованный email.*/
  return `${localPart}@${domain}`;
};
