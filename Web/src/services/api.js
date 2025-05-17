import axios from 'axios';

const defaultBaseURL = "https://runbaseapi-e7avcnaqbmhuh6bp.northeurope-01.azurewebsites.net/api";
const savedURL = localStorage.getItem("apiBaseURL");

const currentBaseURL = savedURL || defaultBaseURL;

const api = axios.create({
  baseURL: currentBaseURL,
});

export const setApiBaseURL = (url) => {
  localStorage.setItem("apiBaseURL", url);
  api.defaults.baseURL = url;
};

export const getApiBaseURL = () => api.defaults.baseURL;

export default api;