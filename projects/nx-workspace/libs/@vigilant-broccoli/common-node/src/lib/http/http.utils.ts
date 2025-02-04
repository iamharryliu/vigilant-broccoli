const makeHttpRequest = async <T>(
  endpoint: string,
  requestOptions,
): Promise<T> => {
  const response = await fetch(endpoint, requestOptions);
  if (!response.ok) {
    throw new Error(
      `Endpoint request for: ${endpoint}\n${requestOptions}\nFailed with ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
};

export const HttpUtils = {
  makeHttpRequest,
};
