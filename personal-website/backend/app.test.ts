import request from 'supertest';
import app, { db, server } from './app';
import { EncryptionService } from '@prettydamntired/node-tools';
import {
  EmailSubscription,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
} from '@prettydamntired/personal-website-common';

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
      const res = await request(app).put(
        `/subscribe/verify-email-subscription/${token}`,
      );
      expect(res.status).toEqual(200);
    });
  });

  describe('vibecheck-lite subscribe endpoint', () => {
    it('should subscribe to vibecheck lite', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE_TO_VIBECHECK_LITE)
        .send({
          email,
          latitude: 43.7690921,
          longitude: -79.197657,
        });
      expect(res.status).toEqual(200);
    });
  });

  describe('unsubscribe from vibecheck-lite endpoint', () => {
    it('should unsubscribe successfully', async () => {
      const token = EncryptionService.encryptData(email);
      const res = await request(app).put(
        `${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.UNSUBSCRIBE_FROM_VIBECHECK_LITE}/${token}`,
      );
      expect(res.status).toEqual(200);
    });
  });

  describe('get vibecheck-lite outfit recommendation endpoint', () => {
    it('Get outfit recommendation', async () => {
      const query = '?lat=43.7690921&lon=-79.197657';
      const res = await request(app).get(
        `${PERSONAL_WEBSITE_BACKEND_ENDPOINTS.GET_OUTFIT_RECOMMENDATION}${query}`,
      );
      expect(res.status).toEqual(200);
    }, 20000);
  });

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
