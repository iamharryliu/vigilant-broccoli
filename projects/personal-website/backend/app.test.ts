import request from 'supertest';
import app, { db, server } from './app';
import { EncryptionService } from '@prettydamntired/node-tools';
import {
  EmailSubscription,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@prettydamntired/test-lib';

const email = 'tester@gmail.com';

describe('Routes', () => {
  test('Test endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(200);
  });

  describe('send message endpoint', () => {
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

  describe('subscribe endpoint', () => {
    it('should subscribe successfully', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email,
        });
      expect(res.status).toEqual(200);
    });
  });

  describe('verify subscription endpoint', () => {
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
