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

// TODO: delete??
export const HttpUtils = {
  makeHttpRequest,
};
