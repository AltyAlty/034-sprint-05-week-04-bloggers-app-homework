import { Model } from 'mongoose';
import { SecurityDeviceDocumentType } from '../document-types/security-device.document-type';
import { SecurityDevice } from '../security-device.entity';

/*Тип модели для пользовательского устройства со статическими методами класса для пользовательского устройства.*/
export type SecurityDeviceModelType = Model<SecurityDeviceDocumentType> & typeof SecurityDevice;
