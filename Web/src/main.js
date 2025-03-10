import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import "./assets/style.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import "bootstrap/dist/js/bootstrap.js";

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({
  components,
  directives,
});

const app = createApp(App);

app.use(router);
app.use(vuetify);
app.mount('#app');

axios.defaults.baseURL = "https://runbase.hu";
