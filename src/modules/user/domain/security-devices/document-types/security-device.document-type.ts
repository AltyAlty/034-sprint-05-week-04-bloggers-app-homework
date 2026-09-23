import { HydratedDocument } from 'mongoose';
import { SecurityDevice } from '../security-device.entity';

/*Тип документа для пользовательского устройства.*/
export type SecurityDeviceDocumentType = HydratedDocument<SecurityDevice>;
