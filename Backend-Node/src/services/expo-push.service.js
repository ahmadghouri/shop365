const axios = require("axios");
const logger = require("../config/logger");

async function sendExpoPush(user, payload) {
  if (!user?.expo_push_token) return;

  try {
    await axios.post(
      "https://exp.host/--/api/v2/push/send",
      [
        {
          to: user.expo_push_token,
          sound: "default",
          title: payload.title || "",
          body: payload.body || "",
          data: {
            type: payload.type || "general",
            reference_id: payload.reference_id
              ? String(payload.reference_id)
              : undefined,
            reference_type: payload.reference_type,
            ...(payload.metadata || {}),
          },
        },
      ],
      { timeout: 5000 },
    );
  } catch (error) {
    logger.warn(
      { userId: user._id, error: error.message },
      "Expo push notification failed",
    );
  }
}

module.exports = { sendExpoPush };
