/**
 * Match Laravel's ResponseController format exactly
 */
function successResponse(res, data = null, message = 'success', statusCode = 200, token = null) {
  const response = { status: statusCode >= 200 && statusCode < 300, message };
  if (data !== null) response.data = data;
  if (token !== null) response.token = token;
  res.status(statusCode).json(response);
}

function errorResponse(res, message = 'Something went wrong', statusCode = 400) {
  res.status(statusCode).json({ status: false, message });
}

module.exports = { successResponse, errorResponse };
