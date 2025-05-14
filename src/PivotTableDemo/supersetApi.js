import axios from "axios";

const API_URL = process.env.REACT_APP_SUPERSET_API || "https://superset.dev.platform.ext.mobilityware.com";

const supersetApi = axios.create({
  baseURL: API_URL,
});

supersetApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getCSRFToken = async () => {
    const res = await supersetApi.get("/api/v1/security/csrf_token/");
    return res.data.result;
  };
  

export const login = async () => {
    const res = await axios.post(`${API_URL}/api/v1/security/login`, {
      username: "admin",
      password: "admin",
      provider: "db",
      refresh: true,
    });
  
    const token = res.data.access_token;
    localStorage.setItem("access_token", token);
  
    // 🔒 After successful login, get CSRF token
    const csrf = await getCSRFToken();
    localStorage.setItem("csrf_token", csrf);
  };
  

export default supersetApi;
