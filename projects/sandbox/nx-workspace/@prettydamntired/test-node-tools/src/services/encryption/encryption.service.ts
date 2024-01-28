import 'dotenv-defaults/config';
import crypto from 'crypto';

export class EncryptionService {
  encryptionMethod: string;
  secretKey: string;
  secretIv: string;

  constructor(
    encryptionMethod = undefined,
    secretKey = undefined,
    secretIv = undefined,
  ) {
    this.encryptionMethod = encryptionMethod || process.env.ENCRYPTION_METHOD;
    this.secretKey = crypto
      .createHash('sha512')
      .update(secretKey || process.env.SECRET_KEY)
      .digest('hex')
      .substring(0, 32);

    this.secretIv = crypto
      .createHash('sha512')
      .update(secretIv || process.env.SECRET_IV)
      .digest('hex')
      .substring(0, 16);
  }

  encryptData(data: string) {
    const cipher = crypto.createCipheriv(
      this.encryptionMethod,
      this.secretKey,
      this.secretIv,
    );
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  decryptData(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(
      this.encryptionMethod,
      this.secretKey,
      this.secretIv,
    );
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }
}
