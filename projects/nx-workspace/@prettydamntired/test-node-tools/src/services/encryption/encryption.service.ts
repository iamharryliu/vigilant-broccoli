import crypto, { Cipher, Decipher } from 'crypto';

export class EncryptionService {
  cipher: Cipher;
  decipher: Decipher;

  constructor(
    encryptionMethod = 'aes-256-cbc',
    secretKey = 'key',
    secretIv = 'secret',
  ) {
    encryptionMethod = encryptionMethod || process.env.ENCRYPTION_METHOD;
    secretKey = crypto
      .createHash('sha512')
      .update(secretKey || process.env.SECRET_KEY)
      .digest('hex')
      .substring(0, 32);

    secretIv = crypto
      .createHash('sha512')
      .update(secretIv || process.env.SECRET_IV)
      .digest('hex')
      .substring(0, 16);

    this.cipher = crypto.createCipheriv(encryptionMethod, secretKey, secretIv);
    this.decipher = crypto.createDecipheriv(
      encryptionMethod,
      secretKey,
      secretIv,
    );
  }

  encryptData(data: string): string {
    return Buffer.from(
      this.cipher.update(data, 'utf8', 'hex') + this.cipher.final('hex'),
    ).toString('base64');
  }

  decryptData(encryptedData: string): string {
    const buff = Buffer.from(encryptedData, 'base64');
    return (
      this.decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      this.decipher.final('utf8')
    );
  }
}
