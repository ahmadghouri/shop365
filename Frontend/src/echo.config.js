// import Echo from "laravel-echo";
// import { API_BASE_URL } from "./config/api";

// import Pusher from "pusher-js";
// window.Pusher = Pusher;

// export const laraEcho = new Echo({
//   broadcaster: "reverb",
//   key: import.meta.env.VITE_REVERB_APP_KEY,
//   wsHost: import.meta.env.VITE_REVERB_HOST,
//   wsPort: import.meta.env.VITE_REVERB_PORT,
//   wssPort: import.meta.env.VITE_REVERB_PORT,
//   forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
//   enabledTransports: ["ws", "wss"],
// });

import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: "4d3df2ee9ea43924df8b",
  cluster: "ap2",
  forceTLS: true,
});
