import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000';

let testPassed = 0;

function incrementCounter(status) {
  if (status) {
    testPassed += 1;
  }
}

const PERSONAL_WEBSITE_ENDPOINTS = [
  axios.get(BACKEND_URL).then(res => incrementCounter(res.status === 200)),
  axios
    .post(`${BACKEND_URL}/send-message`, {
      name: 'Person',
      message: 'message',
      email: 'harryliu1995@gmail.com',
    })
    .then(res => incrementCounter(res.status === 200)),
  axios
    .post(`${BACKEND_URL}/email-alerts`, { email: 'harryliu1995@gmail.com' })
    .then(res => incrementCounter(res.status === 200)),
  axios
    .put(
      `${BACKEND_URL}/verify-email-subscription/N2YzZDMyNDMzMzgwYmZhZDc1ZTBmZjg3NDAxODIzZWQ5ZGJlNzA4YzRjMDI2N2U4ZWUxYTE3Nzc4MDliNzNjNw==`,
    )
    .then(res => incrementCounter(res.status === 200)),
];

const VIBECHECK_ENDPOINTS = [
  axios
    .post(`${BACKEND_URL}/vibecheck/subscribe`, {
      email: 'harryliu1995@gmail.com',
    })
    .then(res => incrementCounter(res.status === 200)),
  axios
    .get(
      `${BACKEND_URL}/get-outfit-recommendation?lat=43.7690921&lon=-79.197657`,
    )
    .then(res => incrementCounter(res.status === 200)),
  axios
    .put(
      `${BACKEND_URL}/vibecheck-lite/unsubscribe/N2YzZDMyNDMzMzgwYmZhZDc1ZTBmZjg3NDAxODIzZWQ5ZGJlNzA4YzRjMDI2N2U4ZWUxYTE3Nzc4MDliNzNjNw%3D%3D`,
      {},
    )
    .then(res => incrementCounter(res.status === 200)),
];

Promise.all([...PERSONAL_WEBSITE_ENDPOINTS, ...VIBECHECK_ENDPOINTS]).then(() =>
  console.log(
    `${testPassed} out of ${
      PERSONAL_WEBSITE_ENDPOINTS.length + VIBECHECK_ENDPOINTS.length
    } tests passed.`,
  ),
);
