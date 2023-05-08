import axios from "axios";

const requests = axios.create({
    baseURL: process.env.NODE_ENV === "development" ? "/api" : 'http://172.26.101.215:6480', //引入接口
    timeout: 10000,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
    },
});

// 请求拦截器
requests.interceptors.request.use(
    (config) => {
        return config;
    },
    (err) => {
        return Promise.reject(err);
    }
);

// 响应拦截器
requests.interceptors.response.use(
    (res) => {
        return res;
    },
    (err) => {
        return Promise.reject(err);
    }
);

export default requests;
