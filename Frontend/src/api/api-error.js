/**
 * Extract a user-friendly error message from an API error
 */
export function getApiErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message) {
    return error.message;
  }
  return "Something went wrong";
}

/**
 * Get validation errors object from API error response
 */
export function getValidationErrors(error) {
  return error?.response?.data?.errors || null;
}

/**
 * Get HTTP status code from error
 */
export function getStatusCode(error) {
  return error?.response?.status || 500;
}
