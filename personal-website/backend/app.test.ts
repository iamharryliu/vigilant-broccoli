import request from 'supertest';
import app, { db, server } from './app';
import { EmailSubscription } from '@prettydamntired/personal-website-types';
import { EncryptionService } from '@prettydamntired/node-tools';

const email = 'tester@gmail.com';

describe('Routes', () => {
  test('Test endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(200);
  });

  test('Send message', async () => {
    const res = await request(app).post('/contact/send-message').send({
      name: 'Person',
      message: 'message',
      email,
    });
    expect(res.status).toEqual(200);
  });

  describe('subscribe endpoint', () => {
    test('Subscribe email', async () => {
      const res = await request(app).post('/subscribe/email-alerts').send({
        email,
      });
      expect(res.status).toEqual(200);
    });
  });

  describe('verify subscription endpoint', () => {
    it('should successfully verify email', async () => {
      await request(app).post('/subscribe/email-alerts').send({
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
      const res = await request(app).post('/vibecheck-lite/subscribe').send({
        email,
        latitude: 43.7690921,
        longitude: -79.197657,
      });
      expect(res.status).toEqual(200);
    });
  });

  it('should unsubscribe successfully', async () => {
    const token = EncryptionService.encryptData(email);
    const res = await request(app).put(`/vibecheck-lite/unsubscribe/${token}`);
    expect(res.status).toEqual(200);
  });

  test('Get outfit recommendation', async () => {
    const res = await request(app).get(
      '/vibecheck-lite/get-outfit-recommendation?lat=43.7690921&lon=-79.197657',
    );
    expect(res.status).toEqual(200);
  }, 20000);

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
