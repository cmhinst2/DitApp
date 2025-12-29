import axios from "axios";

const axiosAPI = axios.create({
  baseURL: "http://localhost/",
  withCredentials: true
});

axiosAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("axios 인터셉터 동작함!!!")
    // 서버가 쿠키 만료로 인해 401 에러를 보냈을 때만 작동
    if (error.response && error.response.status === 401) {
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("loginMember");
      window.location.href = "/"; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default axiosAPI;