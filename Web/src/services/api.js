import axios from 'axios';

const API_URL = process.env.VUE_APP_API_URL;

const api = axios.create({
  baseURL: "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api",
});

export default api;