import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  it('should work', () => {
    const encryptionService = new EncryptionService();
    expect(encryptionService).toBeTruthy();
    expect(encryptionService.encryptData('test')).toBeTruthy();
    expect(encryptionService.encryptData('test')).toBeTruthy();
  });
});
