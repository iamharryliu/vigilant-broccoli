import request from 'supertest';
import app, { db, server } from './app';
import { EmailSubscription } from '@prettydamntired/personal-website-types';

describe('Routes', () => {
  test('Test endpoint', async () => {
    const res = await request(app).get('/');
    expect(res.status).toEqual(200);
  });

  test('Send message', async () => {
    const res = await request(app).post('/contact/send-message').send({
      name: 'Person',
      message: 'message',
      email: 'harryliu1995@gmail.com',
    });
    expect(res.status).toEqual(200);
  });

  test('Subscribe email', async () => {
    const res = await request(app).post('/subscribe/email-alerts').send({
      email: 'harryliu1995@gmail.com',
    });
    expect(res.status).toEqual(200);
  });

  test('Verify email subscription', async () => {
    const res = await request(app).put(
      '/subscribe/verify-email-subscription/N2YzZDMyNDMzMzgwYmZhZDc1ZTBmZjg3NDAxODIzZWQ5ZGJlNzA4YzRjMDI2N2U4ZWUxYTE3Nzc4MDliNzNjNw==',
    );
    expect(res.status).toEqual(200);
  });

  test('Get outfit recommendation', async () => {
    const res = await request(app).get(
      '/vibecheck-lite/get-outfit-recommendation?lat=43.7690921&lon=-79.197657',
    );
    expect(res.status).toEqual(200);
  }, 20000);

  test('Subscribe to vibecheck lite', async () => {
    const res = await request(app).post('/vibecheck-lite/subscribe').send({
      email: 'harryliu1995@gmail.com',
      latitude: 43.7690921,
      longitude: -79.197657,
    });
    expect(res.status).toEqual(200);
  });

  test('Verify email subscription', async () => {
    const res = await request(app).put(
      '/vibecheck-lite/unsubscribe/N2YzZDMyNDMzMzgwYmZhZDc1ZTBmZjg3NDAxODIzZWQ5ZGJlNzA4YzRjMDI2N2U4ZWUxYTE3Nzc4MDliNzNjNw%3D%3D',
    );
    expect(res.status).toEqual(200);
  });

  afterAll(async () => {
    await EmailSubscription.collection.drop();
    server.close();
    db.close();
  });
});
