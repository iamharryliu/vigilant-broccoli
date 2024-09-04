import request from 'supertest';
import app, { db, server } from './main';
import { HTTP_STATUS_CODES } from '@prettydamntired/common-lib';
import { EmailSubscription } from '@prettydamntired/personal-website-api-lib';
import { VibecheckLiteSubscribeRequest } from '@prettydamntired/personal-website-lib';

describe('Routes', () => {
  test('index', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
  });

  test('invalid path', async () => {
    const res = await request(app).get('/asdf');
    expect(res.status).toEqual(HTTP_STATUS_CODES.INVALID_PATH);
  });

  test('/subscribe', async () => {
    const email = 'test@email.com';
    const latitude = 43;
    const longitude = 79;
    const res = await request(app)
      .post('/subscribe')
      .send({
        email,
        latitude,
        longitude,
      } as VibecheckLiteSubscribeRequest);
    expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
    const subscriptions = await EmailSubscription.find();
    expect(subscriptions.length).toEqual(1);
  });

  test('/unsubscribe', async () => {
    const email = 'test@email.com';
    const latitude = 43;
    const longitude = 79;
    await request(app)
      .delete('/subscribe')
      .send({
        email,
        latitude,
        longitude,
      } as VibecheckLiteSubscribeRequest);

    const res = await request(app).delete(`/unsubscribe/${email}`);
    expect(res.status).toEqual(HTTP_STATUS_CODES.OK);
    const subscriptions = await EmailSubscription.find();
    expect(subscriptions.length).toEqual(0);
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
