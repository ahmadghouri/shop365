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

/**
 * Send the same push payload to many devices at once.
 * Expo accepts up to 100 messages per request, so we chunk the token list.
 * @param {string[]} tokens  Expo push tokens
 * @param {{ title?: string, body?: string, type?: string, reference_id?: any, reference_type?: string, metadata?: object }} payload
 */
async function sendExpoPushBulk(tokens, payload) {
  const valid = (tokens || []).filter(Boolean);
  if (!valid.length) return;

  const data = {
    type: payload.type || "general",
    reference_id: payload.reference_id ? String(payload.reference_id) : undefined,
    reference_type: payload.reference_type,
    ...(payload.metadata || {}),
  };

  const CHUNK = 100;
  for (let i = 0; i < valid.length; i += CHUNK) {
    const messages = valid.slice(i, i + CHUNK).map((to) => ({
      to,
      sound: "default",
      title: payload.title || "",
      body: payload.body || "",
      data,
    }));
    try {
      await axios.post("https://exp.host/--/api/v2/push/send", messages, {
        timeout: 10000,
      });
    } catch (error) {
      logger.warn(
        { count: messages.length, error: error.message },
        "Bulk Expo push chunk failed",
      );
    }
  }
}

module.exports = { sendExpoPush, sendExpoPushBulk };
