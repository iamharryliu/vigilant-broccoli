import crypto from 'crypto';

const ENCRYPTION_SECRET_KEY = crypto
  .createHash('sha512')
  .update(process.env.SECRET_KEY)
  .digest('hex')
  .substring(0, 32);
const ENCRYPTION_SECRET_IV = crypto
  .createHash('sha512')
  .update(process.env.SECRET_IV)
  .digest('hex')
  .substring(0, 16);

export class EncryptionService {
  static encryptData(data: string) {
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
