import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  it('should be created', () => {
    const encryptionService = new EncryptionService();
    expect(encryptionService).toBeTruthy();

    const value = 'test';
    const encryptedData = encryptionService.encryptData(value);
    expect(encryptedData).toBeTruthy();
    const decryptedData = encryptionService.decryptData(encryptedData);
    expect(decryptedData).toBe(value);
  });
});
