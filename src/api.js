import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8081"
});

// Automatically attach X-User-Id header if logged in, except for auth routes
API.interceptors.request.use((req) => {
    if (req.url && !req.url.startsWith('/auth')) {
        const userString = localStorage.getItem("budget_user");
        if (userString) {
            const user = JSON.parse(userString);
            if (user.userId) {
                req.headers['X-User-Id'] = user.userId;
            }
        }
    }
    return req;
});

export default API;