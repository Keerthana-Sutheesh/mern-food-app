import axios from "axios";

baseURL:`${process.env.REACT_APP_API_URL}/api/`

export const registerUser = (data) => axios.post(`${BASE_URL}/register`, data);
export const loginUser = (data) => axios.post(`${BASE_URL}/login`, data);