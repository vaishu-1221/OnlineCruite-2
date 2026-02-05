import axios from "axios";

const axiosInstance = axios.create({
    baseURL:"/api",
    withCredentials: true, // Include cookies for cross-origin requests
});

export default axiosInstance;