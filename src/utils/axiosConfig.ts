import axios from "axios";

const axiosConfig = axios.create({ baseURL: process.env.NEXT_PUBLIC_BASE_URL });

export default axiosConfig;
