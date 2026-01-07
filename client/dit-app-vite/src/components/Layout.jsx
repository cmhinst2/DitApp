import { Header, Footer, Sidebar } from "../components/Form";
import LoginPage from "../pages/LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import TrendPage from "../pages/TrendPage";
import InterviewPage from "../pages/InterviewPage";
import KakaoCallback from "./KakaoCallback";
import Main from "../pages/MainPage";
import ReviewPage from "../pages/ReviewPage";


export default function Layout({isLogin, setIsLogin}) {

  return (
    <>
      <Header />

      <Routes>
        {/* 1. 로그인 여부와 상관없이 접근 가능한 '공개 경로' */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/kakao/callback" element={<KakaoCallback setIsLogin={setIsLogin} />} />

        {/* 2. 로그인했을 때만 보여주는 경로 */}
        {isLogin ? (
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen w-full">
                <Sidebar setIsLogin={setIsLogin} />
                <main className="basis-5/6 pt-20 px-8  min-h-screen bg-slate-50">
                  <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/trends" element={<TrendPage />} />
                    <Route path="/interview" element={<InterviewPage />} />
                    <Route path="/codereview" element={<ReviewPage />} />
                  </Routes>
                </main>
              </div>
            }
          />
        ) : (
          /* 로그인 안 했는데 다른 페이지 접근하면 로그인 페이지로 리다이렉트 */
          <>
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route path="/" element={<LoginPage />} />
          </>
        )}
      </Routes>

      <Footer />
    </>
  );
}
