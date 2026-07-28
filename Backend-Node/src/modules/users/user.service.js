const User = require('./user.model');
const { getPaginationParams, paginateResponse } = require('../../utils/pagination');

class UserService {
  async list(query) {
    const { page, perPage, skip } = getPaginationParams(query);
    const filter = { deleted_at: null };
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone_no: { $regex: query.search, $options: 'i' } },
      ];
    }
    if (query.role) filter.role = query.role;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(perPage).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    return paginateResponse(users, total, page, perPage);
  }

  async getById(id) {
    const user = await User.findById(id);
    if (!user || user.deleted_at) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async usersRegisteredToday() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return User.find({ createdAt: { $gte: twoDaysAgo }, deleted_at: null }).sort({ createdAt: -1 });
  }
}

module.exports = new UserService();
