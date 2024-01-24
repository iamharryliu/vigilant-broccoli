import request from 'supertest';
import app, { db, server } from './app';
import { EncryptionService } from '@prettydamntired/test-node-tools';
import {
  EmailSubscription,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@prettydamntired/test-lib';

const email = 'tester@gmail.com';

describe('Routes', () => {
  test('/', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(200);
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE, () => {
    it('should send message successfully', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SEND_MESSAGE)
        .send({
          name: 'Person',
          message: 'message',
          email,
        });
      expect(res.status).toEqual(200);
    });
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE, () => {
    it('should subscribe successfully', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email,
        });
      expect(res.status).toEqual(200);
    });
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION, () => {
    it('should successfully verify email', async () => {
      await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION)
        .send({
          email: email,
        });
      const token = EncryptionService.encryptData(email);
      const res = await request(app)
        .put(`/subscribe/verify-email-subscription`)
        .send({ token });
      expect(res.status).toEqual(200);
    });
  });

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
