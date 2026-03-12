import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '30s', target: 200 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.2'],
  },
};

export default function () {
  const res = http.get(TARGET_URL);

  check(res, {
    'status is 200': r => r.status === 200,
  });

  sleep(1);
}
