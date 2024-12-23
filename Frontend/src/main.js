import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./routes/routes.js";
import Toast from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./style.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faUserSecret } from "@fortawesome/free-solid-svg-icons";
import cordovaApp from "./main-cordova.js";
import "./echo.config.js";
import { useAuthStore } from "./stores/authStore.js";

const initVueApp = () => {
  library.add(faUserSecret);
  const app = createApp(App);

  const pinia = createPinia();
  app.use(pinia);
  app.use(router);
  app.use(Toast, {
    position: "top-right",
  });

  app.component("font-awesome-icon", FontAwesomeIcon);

  app.mount("#app");

  useAuthStore().initializeStore();
};

function onDeviceReady() {
  console.log("application ready", window);

  if (typeof window.cordova !== "undefined") {
    window.cordovaApp = new cordovaApp();

    // if (window.document.hidden) {
    //   console.log("application hidden", window);
    // }
  }

  try {
    initVueApp();
  } catch (error) {
    console.log("Error initializing vue app", error);
    alert("Error initializing vue app");
  }
}

document.addEventListener("deviceready", onDeviceReady);

document.addEventListener(
  "pause",
  function () {
    console.log("application paused", window);
    window.cordovaAppkeepAwakeInterval = setInterval(function () {
      console.log("application initializing store", { window });
      useAuthStore().initializeStore();
    }, 1000 * 60);
  },
  false
);

document.addEventListener(
  "resume",
  function () {
    console.log("application resumed", window);
    clearInterval(window.cordovaAppkeepAwakeInterval);
  },
  false
);

if (typeof window.cordova === "undefined") {
  document.dispatchEvent(new CustomEvent("deviceready", {}));
}
