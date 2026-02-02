import { CorsOptions } from 'cors';

const makeHttpRequest = async <T>(
  endpoint: string,
  requestOptions: RequestInit,
): Promise<T> => {
  const response = await fetch(endpoint, requestOptions);
  if (!response.ok) {
    throw new Error(
      `Endpoint request for: ${endpoint}\n${requestOptions}\nFailed with ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
};

export const createCorsOptions = (allowedOrigins: string[]): CorsOptions => ({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true,
});

// TODO: delete??
export const HttpUtils = {
  makeHttpRequest,
};
