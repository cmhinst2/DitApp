import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosAPI from "../api/axiosInterceptor.js";
import axios from "axios";

const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

export default function KakaoCallback({ setIsLogin }) {
  const navigate = useNavigate();
  const isProcessed = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code"); // 발급받은 인가코드 얻어오기

    if (code && !isProcessed.current) {
      isProcessed.current = true;
      sendOauthToken(code);
    }
  }, []);

  // 토큰 발급 받기
  const sendOauthToken = async (code) => {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('client_id', KAKAO_REST_API_KEY);
      params.append('redirect_uri', REDIRECT_URI);
      params.append('code', code);

      const response = await axios.post("https://kauth.kakao.com/oauth/token", params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
      });

      const result = response.data;
      getUserInfo(result.access_token, result.refresh_token); // 사용자 정보 조회 요청

    } catch (error) {
      console.error("카카오로 토큰 전송 중 에러 발생");
    }
  }

  const getUserInfo = async (acc, ref) => {
    try {
      const response = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${acc}`,
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });

      const result = response.data;

      // 사용자 정보 추출
      const userInfo = {
        memberEmail: result.id,
        memberName: result.kakao_account.profile.nickname,
        loginType: 'K',
        memberProfile: result.kakao_account.profile.profile_image_url,
        accessToken : acc,
        refreshToken : ref
      }
      
      serverKakaoLogin(userInfo);

    } catch (error) {
      console.error("카카오 사용자 정보 조회 중 예외 발생")
    }
  }

  // 카카오 로그인 DB처리 호출
  const serverKakaoLogin = async (userInfo) => {
    try {
      const response = await axiosAPI.post("/api/auth/kakao/login", userInfo, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      localStorage.setItem("loginMember", JSON.stringify(response.data));
      setIsLogin(JSON.stringify(response.data));
      navigate("/");
      
    } catch (error) {
      console.error("로그인 실패:", error);
      alert("로그인 중 오류가 발생했습니다.");
      navigate("/login");
    }
  };

  return <div>로그인 처리 중입니다...</div>;
}