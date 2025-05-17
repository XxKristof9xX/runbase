import axios from 'axios';

const api = axios.create({
  baseURL: "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api",
});

export default api;