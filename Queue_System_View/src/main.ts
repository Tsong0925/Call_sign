import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import axios from "./utils/request";
import locale from "element-plus/lib/locale/lang/zh-cn";
import "./assets/style/reset.css";
import "./assets/style/myStyle.scss";

const app = createApp(App);
axios.defaults.withCredentials = true;
app.config.globalProperties.$axios = axios;

app.use(createPinia());
app.use(router);
app.use(ElementPlus, { locale });

app.mount("#app");
