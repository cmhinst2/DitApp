import { Header, Footer, Sidebar } from "../components/Form";
import LoginPage from "./LoginPage";
import { Routes, Route, Navigate } from "react-router-dom";
import TrendPage from "./TrendPage";
import InterviewPage from "./InterviewPage";
import KakaoCallback from "../components/KakaoCallback";
import Main from "./MainPage";
import ReviewPage from "./ReviewPage";
import { InterviewHistory } from "./InterviewHistoryPage";
import { ReviewHistory } from "./ReviewHistoryPage";


export default function Layout({isLogin, setIsLogin}) {

  return (
    <div className="flex flex-col h-screen">
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
              <div className="flex w-full flex-1 overflow-y-auto bg-slate-50">
                <Sidebar setIsLogin={setIsLogin} />
                <main className="basis-5/6 px-8 h-full">
                  <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/trends" element={<TrendPage />} />
                    <Route path="/interview" element={<InterviewPage />} />
                    <Route path="/review" element={<ReviewPage />} />
                    <Route path="/interview/history" element={<InterviewHistory />} />
                    <Route path="/review/history" element={<ReviewHistory />} />
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
    </div>
  );
}
