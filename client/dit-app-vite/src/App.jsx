import { BrowserRouter } from 'react-router-dom'
import Layout from './pages/Layout'
import { useEffect, useRef, useState } from 'react'
import axios from 'axios';

function App() {
  // 로그인 상태
  const [isLogin, setIsLogin] = useState(JSON.parse(localStorage.getItem("loginMember")));

  // 화면 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 첫 렌더링인지 확인 (StrictMode의 두번 호출 방지)
  const isFirstRender = useRef(true);
  // useRef - 값이 변해도 리렌더링 X
  // 렌더링 주기와 상관없이 유지되어야 하는 값을 저장할 때 사용
  // .current 를 통해 값 수정, 접근 가능

  // 화면 첫 렌더링 시 토큰 유효한지 확인
  useEffect(() => {

    async function checkAuth() {
      try {
        await axios.get("http://localhost/api/auth/me", {
          withCredentials: true
        });

      } catch (error) {
        if (error.status === 401) {
          console.log("인증되지 않은 사용자 : 로그인 페이지로 이동");
          localStorage.clear();
          setIsLogin(false);
        }
      }
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      checkAuth().finally(() => setIsLoading(false));
    }

  }, []);

  if (isLoading) return null; // 리렌더링 시 깜빡임 방지

  return (
    <BrowserRouter>
      <Layout isLogin={isLogin} setIsLogin={setIsLogin} />
    </BrowserRouter>
  )
}

export default App
