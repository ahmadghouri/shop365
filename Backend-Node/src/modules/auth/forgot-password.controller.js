const User = require('../users/user.model');
const { hashPassword } = require('../../utils/password');
const { errorResponse, successResponse } = require('../../utils/api-response');

async function updatePassword(req, res, next) {
  try {
    const user = await User.findOne({ phone_no: req.body.phone_no });
    if (!user) {
      return errorResponse(res, 'User does not exist', 400);
    }
    user.password = await hashPassword(req.body.password);
    await user.save();
    successResponse(res, [], 'Password Updated');
  } catch (error) { next(error); }
}

module.exports = { updatePassword };
