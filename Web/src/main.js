import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import "./assets/style.css";
import 'bootstrap/dist/css/bootstrap.min.css'

import axios from "axios";

axios.defaults.baseURL = "https://runbase.hu";

createApp(App).use(router).mount('#app')
import "bootstrap/dist/js/bootstrap.js"
