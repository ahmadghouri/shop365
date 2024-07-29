import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Replace with your actual Pusher configuration
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "9a043ec9f09327c28a74",
  cluster: "ap2",
  encrypted: true,
});

export default echo;
