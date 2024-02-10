import request from 'supertest';
import app, { db, server } from './main';
import { EncryptionService } from '@prettydamntired/test-node-tools';
import { HTTP_STATUS_CODES } from '@prettydamntired/test-lib';
import {
  GENERAL_ERROR_CODE,
  PERSONAL_WEBSITE_BACKEND_ENDPOINTS,
  SubscribeRequest,
} from '@prettydamntired/personal-website-lib';
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
        } as SubscribeRequest);
      expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
      const subscribers = await EmailSubscription.find({});
      expect(subscribers.length).toEqual(1);
    });

    it('should return correct error if no email is sent', async () => {
      const res = await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email: '',
        } as SubscribeRequest);
      expect(res.status).toEqual(HTTP_STATUS_CODES.BAD_REQUEST);
      expect(res.body.error).toEqual(GENERAL_ERROR_CODE.EMAIL_IS_REQUIRED);
    });
  });

  describe(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION, () => {
    it('should successfully verify email', async () => {
      await request(app)
        .post(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.SUBSCRIBE)
        .send({
          email: email,
        });
      const encryptionService = new EncryptionService();
      const token = encryptionService.encryptData(email);
      const res = await request(app)
        .put(`/subscribe/verify-email-subscription`)
        .send({ token });
      expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
      const subscriber = await EmailSubscription.findOne({});
      expect(subscriber.isVerified).toEqual(true);
    });

    it('should return correct error if trying to verify non existant email', async () => {
      const encryptionService = new EncryptionService();
      const token = encryptionService.encryptData('bademail@email.com');
      const res = await request(app)
        .put(PERSONAL_WEBSITE_BACKEND_ENDPOINTS.VERIFY_SUBSCRIPTION)
        .send({ token });
      expect(res.status).toEqual(HTTP_STATUS_CODES.FORBIDDEN);
      expect(res.body.error).toEqual(GENERAL_ERROR_CODE.EMAIL_DOES_NOT_EXIST);
    });
  });

  afterEach(() => {
    EmailSubscription.deleteMany({});
  });

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
