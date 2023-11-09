import crypto from 'crypto';
import {
  ENCRYPTION_SECRET_KEY,
  ENCRYPTION_SECRET_IV,
} from '../configs/app.const';

export class EncryptionService {
  static encryptData(data) {
    const cipher = crypto.createCipheriv(
      process.env.ENCRYPTION_METHOD,
      ENCRYPTION_SECRET_KEY,
      ENCRYPTION_SECRET_IV,
    );
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  static decryptData(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_METHOD,
      ENCRYPTION_SECRET_KEY,
      ENCRYPTION_SECRET_IV,
    );
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }
}
