const API_BASE_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') : 'http://192.168.32.201:5000';

export default API_BASE_URL;
