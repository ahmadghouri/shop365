const User = require('../users/user.model');
const { hashPassword, comparePassword } = require('../../utils/password');
const { generateToken } = require('../../utils/jwt');
const { UserRole } = require('../../common/enums');
const LoginSession = require('./login-session.model');
const { notifyUser } = require('../../services/socket.service');

function phoneCandidates(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('0092')) {
    return [`0${digits.slice(4)}`, `+92${digits.slice(4)}`];
  }
  if (digits.startsWith('92')) {
    return [`0${digits.slice(2)}`, `+${digits}`];
  }
  if (digits.startsWith('0')) {
    return [digits, `+92${digits.slice(1)}`];
  }
  return [digits, `+92${digits}`];
}

class AuthService {
  async register(data) {
    const existing = await User.findOne({ phone_no: { $in: phoneCandidates(data.phone_no) } });
    if (existing) {
      const error = new Error('Phone number already registered');
      error.statusCode = 409;
      throw error;
    }

    const user = await User.create({
      name: data.name || null,
      phone_no: data.phone_no,
      email: data.email || null,
      password: await hashPassword(data.password),
      role: UserRole.END_USER,
    });

    const session = await LoginSession.create({
      user_id: user._id,
      platform: data.platform || 'unknown',
      device: data.device || 'Unknown device',
      ip_address: data.ip_address || '',
      user_agent: data.user_agent || '',
      geo: {
        city:      data.geo?.city      || data.location || '',
        latitude:  data.geo?.latitude  ?? data.latitude  ?? null,
        longitude: data.geo?.longitude ?? data.longitude ?? null,
      },
    });
    const token = generateToken({ id: user._id.toString(), role: user.role, sid: session._id.toString() });
    return { user, token };
  }

  async login(data) {
    let user = await User.findOne({ phone_no: { $in: phoneCandidates(data.phone_no) } });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Populate household only if household_id is a valid ObjectId
    if (user.household_id && String(user.household_id).match(/^[0-9a-fA-F]{24}$/)) {
      try {
        user = await user.populate('household_id');
      } catch (_) {
        /* skip if populate fails */
      }
    }

    const sessionData = {
      platform:      data.platform || 'unknown',
      device:        data.device   || 'Unknown device',
      ip_address:    data.ip_address || '',
      user_agent:    data.user_agent || '',
      geo: {
        city:      data.geo?.city      || data.location || '',
        latitude:  data.geo?.latitude  ?? data.latitude  ?? null,
        longitude: data.geo?.longitude ?? data.longitude ?? null,
      },
      logged_in_at:  new Date(),
      logged_out_at: null,
      revoked_at:    null,
    };

    // Only reuse sessions that are still ACTIVE (not logged out, not revoked)
    // If the matching session was logged out → it stays in history, a new one is created
    const existingActive = await LoginSession.findOneAndUpdate(
      {
        user_id:       user._id,
        device:        sessionData.device,
        ip_address:    sessionData.ip_address,
        logged_out_at: null,   // only active sessions
        revoked_at:    null,   // not force-revoked
      },
      { $set: sessionData },
      { new: true },
    );

    const session = existingActive ?? await LoginSession.create({ user_id: user._id, ...sessionData });

    // Notify all other active sessions of this user about the new login
    // Only when a brand-new session was created (not a known-device refresh)
    if (!existingActive) {
      const city = sessionData.geo?.city || '';
      const locationStr = city ? `, from ${city}` : '';
      // Fire-and-forget — do not await so login response is not delayed
      notifyUser(user._id, {
        type: 'security',
        title: 'New login to your account',
        body: `A new login was detected on ${sessionData.device}${locationStr}.`,
        metadata: {
          device:   sessionData.device,
          platform: sessionData.platform,
          city,
          latitude:  sessionData.geo?.latitude  ?? null,
          longitude: sessionData.geo?.longitude ?? null,
        },
      });
    }

    const token = generateToken({ id: user._id.toString(), role: user.role, sid: session._id.toString() });
    return { user, token };
  }

  async adminLogin(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user || !(await comparePassword(data.password, user.password))) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.RESTAURANT_ADMIN) {
      const error = new Error('Unauthorized access');
      error.statusCode = 403;
      throw error;
    }
    const token = generateToken({ id: user._id.toString(), role: user.role });
    return { user, token };
  }

  async updatePassword(data) {
    const user = await User.findOne({ phone_no: data.phone_no });
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    user.password = await hashPassword(data.password);
    await user.save();
    return user;
  }
}

module.exports = AuthService;
