import { useEffect, useRef, useState } from "react";
import Message from "../components/Messages";
import { InterviewSpinner } from "../components/Assets";
import axiosAPI from "../api/axiosInterceptor";

const POSITION_LABEL = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자 (Java)",
  fullstack: "풀스택 개발자",
};

const InterviewFeedback = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 화면 렌더링을 위한 로더
  const [feedback, setFeedback] = useState("");
  const [position, setPosition] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      const { scrollHeight, clientHeight } = bottomRef.current;
      bottomRef.current.scrollTo({
        top: scrollHeight - clientHeight
      });
    }
  }, [messages]);

  useEffect(() => {
    const fetchInterviewHistory = async () => {
      try {
        const localData = JSON.parse(localStorage.getItem("interviewSession"));

        if (localData && localData.end == true) {
          setPosition(POSITION_LABEL[localData.position]);
          const response = await axiosAPI.get(`/ai/interview/feedback/${localData.currentSessionId}`);
          if (response.data) { // 세션에서 인터뷰한 이력이 있음

            const result = response.data.interviewMessageList
              .filter(element => element.role !== 'FIRST')
              .map(element => ({
                role: element.role,
                content: element.content
              }));

            setMessages(result); // 서버에서 받아온 이전 대화 목록 세팅
            setFeedback(JSON.parse(response.data.feedback));
          }
        }
      } catch (error) {
        console.error("이전 기록 로딩 실패", error);
        localStorage.removeItem("interviewSession");
      } finally {
        setIsLoading(false);
      }
    }

    fetchInterviewHistory();
  }, []);

  if (isLoading) return <InterviewSpinner />;

  return (
    <section className="mt-5 max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">
        AI 모의면접 · {position}
      </h2>

      <div ref={bottomRef} className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl border">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
      </div>
      {/* AI 피드백 섹션 */}
      {feedback && (
        <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-8">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm">

            {/* 상단: 점수 및 타이틀 */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI 심층 피드백 리포트
                </h2>
                <p className="text-sm text-slate-500 mt-1">면접 내용을 바탕으로 분석한 결과입니다.</p>
              </div>
              <div className="flex flex-col items-center justify-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-blue-100">
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Score</span>
                <span className="text-3xl font-black text-blue-600">{feedback.score}</span>
              </div>
            </div>

            {/* 상세 분석 내용 */}
            <div className="grid gap-4">
              <FeedbackCard
                title="🗣️ 면접 태도 (Attitude)"
                content={feedback.attitude}
                color="blue"
              />
              <FeedbackCard
                title="📚 기술 지식 (Knowledge)"
                content={feedback.knowledge}
                color="emerald"
              />
              <FeedbackCard
                title="🚀 개선 방향 (Improvement)"
                content={feedback.improvement} // 오타 조심: improvment -> improvement
                color="amber"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

// 상세 항목을 위한 하위 컴포넌트
const FeedbackCard = ({ title, content, color }) => {
  const colors = {
    blue: "bg-blue-50 border-blue-100 text-blue-800",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-800",
    amber: "bg-amber-50 border-amber-100 text-amber-800"
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
        {title}
      </h3>
      <p className="text-sm leading-relaxed opacity-90 whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};

export default InterviewFeedback;