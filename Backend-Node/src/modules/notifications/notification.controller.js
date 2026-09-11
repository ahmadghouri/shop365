const Notification = require("./notification.model");

const MAX_LIMIT = 100;

class NotificationController {
  async index(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
      const limit = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 20, 1),
        MAX_LIMIT,
      );
      const filter = { user_id: req.user._id };
      const total = await Notification.countDocuments(filter);
      const notifs = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      res.json({
        message: "Notifications",
        data: notifs.map((n) => ({
          id: n._id.toString(),
          type: n.type,
          title: n.title,
          body: n.body,
          read: n.read,
          created_at: n.createdAt,
          reference_id: n.reference_id ? n.reference_id.toString() : undefined,
          reference_type: n.reference_type || undefined,
          metadata: n.metadata || undefined,
        })),
        meta: {
          page,
          limit,
          total,
          hasMore: page * limit < total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req, res, next) {
    try {
      await Notification.updateOne(
        { _id: req.params.id, user_id: req.user._id },
        { read: true },
      );
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req, res, next) {
    try {
      await Notification.updateMany(
        { user_id: req.user._id, read: false },
        { read: true },
      );
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
