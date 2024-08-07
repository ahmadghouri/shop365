import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import router from "./routes/routes.js";
import Toast from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import "./style.css";

const app = createApp(App);

const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(Toast, {
  position: "top-right",
});

app.mount("#app");
