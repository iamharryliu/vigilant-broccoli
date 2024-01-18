import axios from 'axios';

describe('GET /', () => {
  it('should return a message', async () => {
    const res = await axios.get('http://localhost:3000/api');

    expect(res.status).toBe(200);
  });
});
