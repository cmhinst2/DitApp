import { Routes, Route } from "react-router-dom";
import TrendPage from "../pages/TrendPage";
import InterviewPage from "../pages/InterviewPage";

export default function Content() {
  return (
    <>
      <Sidebar />
      <main className="pt-20 px-8 w-full min-h-screen bg-slate-50">
        <Routes>
          <Route path="/trends" element={<TrendPage />} />
          <Route path="/interview" element={<InterviewPage />} />

          <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        </Routes>
      </main>
    </>
  );
}
