export const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Unable to reach the Ramixaq AI API. Please try again in a moment.";
  }

  return error?.message || fallbackMessage;
};
