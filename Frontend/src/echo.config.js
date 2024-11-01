import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: "4d3df2ee9ea43924df8b",
  cluster: "ap2",
  forceTLS: true,
  disableStats: true, // reduces requests to Pusher stats endpoints
  retryAfter: 2000,  // 2 seconds after disconnect
  reconnect: {
    retries: Infinity,  // Infinite retries
    initialDelay: 1000, // Start with 1 second
    maxDelay: 10000,    // Max delay of 10 seconds
  }
});

window.Pusher.logToConsole = true;
window.Echo.connector.pusher.connection.bind('disconnected', () => {
  console.log("Connection lost. Retrying...");
});
window.Echo.connector.pusher.connection.bind('connecting', () => {
  console.log("Reconnecting to Pusher...");
});
window.Echo.connector.pusher.connection.bind('connected', () => {
  console.log("Connected to Pusher successfully!");
});