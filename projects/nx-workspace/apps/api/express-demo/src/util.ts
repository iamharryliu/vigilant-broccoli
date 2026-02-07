export const handleApiCall = async (
  apiCall: () => Promise<any>,
  errorMessage: string,
) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error) {
    console.error(errorMessage);
    return [];
  }
};
