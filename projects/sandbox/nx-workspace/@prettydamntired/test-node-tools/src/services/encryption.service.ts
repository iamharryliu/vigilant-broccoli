import crypto from 'crypto';

export class EncryptionService {
  encryptionSecretKey: string;
  encryptionSecretIv: string;

  constructor() {
    this.encryptionSecretKey = crypto
      .createHash('sha512')
      .update(process.env.SECRET_KEY)
      .digest('hex')
      .substring(0, 32);

    this.encryptionSecretIv = crypto
      .createHash('sha512')
      .update(process.env.SECRET_IV)
      .digest('hex')
      .substring(0, 16);
  }

  encryptData(data: string) {
    const cipher = crypto.createCipheriv(
      process.env.ENCRYPTION_METHOD,
      this.encryptionSecretKey,
      this.encryptionSecretIv,
    );
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('base64');
  }

  decryptData(encryptedData) {
    const buff = Buffer.from(encryptedData, 'base64');
    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_METHOD,
      this.encryptionSecretKey,
      this.encryptionSecretIv,
    );
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }
}
