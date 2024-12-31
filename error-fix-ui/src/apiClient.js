import axios from 'axios';

const apiKey = process.env.REACT_APP_API_KEY;
const backendURL = process.env.REACT_APP_BACKEND_URL;

const apiClient = axios.create({
  baseURL: backendURL || 'http://localhost:4001',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to log requests
apiClient.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});
export default apiClient;
