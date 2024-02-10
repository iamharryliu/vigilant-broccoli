import request from 'supertest';
import app, { db, server } from './main';
import { EncryptionService } from '@prettydamntired/test-node-tools';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import { PERSONAL_WEBSITE_BACKEND_ENDPOINTS } from '@prettydamntired/personal-website-lib';
import { EmailSubscription } from '@prettydamntired/personal-website-api-lib';

const email = 'tester@gmail.com';

describe('Routes', () => {
  test('index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
  });

  test('invalid path', async () => {
    const res = await request(app).get('/asdf');
    expect(res.status).toEqual(HTTP_STATUS_CODES.INVALID_PATH);
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
      expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
    });
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE, () => {
    it('should subscribe successfully', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email,
        });
      expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
    });

    it('should return internal server error if no email is sent', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email: '',
        });
      expect(res.status).toEqual(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.body.error).toBeTruthy();
    });
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION, () => {
    it('should successfully verify email', async () => {
      await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION)
        .send({
          email: email,
        });
      const encryptionService = new EncryptionService();
      const token = encryptionService.encryptData(email);
      const res = await request(app)
        .put(`/subscribe/verify-email-subscription`)
        .send({ token });
      expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
    });
  });

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
