import { useEffect, useRef, useState } from "react";
import Message from "../components/Messages";
import axiosAPI from "../api/axiosInterceptor";

const POSITION_LABEL = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자 (Java)",
  fullstack: "풀스택 개발자",
};

export default function InterviewPage() {
  const [sessionId, setSessionId] = useState(null); // 현재 세션 id 
  const [isStarted, setIsStarted] = useState(false); // 면접 시작 여부
  const [selectedPosition, setSelectedPosition] = useState(null); // 포지션 role
  const [messages, setMessages] = useState([]); // 인터뷰 대화 메시지 저장 배열
  const [input, setInput] = useState(""); // 현재 작성한 input 값
  const [isLoading, setIsLoading] = useState(false); // 메세지 전송중 로딩
  const bottomRef = useRef(null);

  // 챗 화면 스크롤 하단 고정 
  useEffect(() => {
    if (bottomRef.current) {
      const { scrollHeight, clientHeight } = bottomRef.current;
      // scrollTop을 최대로 높여서 스크롤을 맨 아래로 내림
      bottomRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  //진행 세션 여부 확인
  useEffect(() => {
    const savedSessionId = JSON.parse(localStorage.getItem("interviewSession"));

    if (savedSessionId) {
      loadInterview(savedSessionId.currentSessionId);
    }
  }, []);

  // 종료되지 않은 기존 면접 이어서 하기
  const loadInterview = async (id) => {
    try {
      const response = await axiosAPI.get(`/ai/interview/history/${id}`);
      const localData = JSON.parse(localStorage.getItem("interviewSession"));
      if (response.data && response.data.length > 0) { // 세션에서 인터뷰한 이력이 있음
        setSessionId(id); // 현재 세션 세팅
        setIsStarted(true); // 인터뷰 계속 진행
        setSelectedPosition(localData.position); // 진행한 인터뷰 포지션

        const result = response.data
          .filter(element => element.role !== 'FIRST')
          .map(element => ({
            role: element.role,
            content: element.content
          }));

        setMessages(result); // 서버에서 받아온 이전 대화 목록 세팅
      }
    } catch (error) {
      console.error("이전 기록 로딩 실패", error);
      localStorage.removeItem("interviewSession");
    }
  };

  // 인터뷰 시작 - 포지션 정하기부터
  const startInterview = async (selectRole) => {

    try {
      const member = JSON.parse(localStorage.getItem("loginMember"));
      const res = await axiosAPI.post('/ai/interview/position', {
        memberNo: member.memberNo, position: POSITION_LABEL[selectRole]
      });

      const { sessionId, role, content } = res.data;
      const newSessionId = sessionId;

      const interviewStorageData = { 'currentSessionId': newSessionId, 'position': selectRole };
      localStorage.setItem("interviewSession", JSON.stringify(interviewStorageData));

      setMessages([
        {
          role: role,
          content: content,
        },
      ]);
      setSessionId(newSessionId);
      setSelectedPosition(selectRole);
      setIsStarted(true);

    } catch (error) {
      console.error("Error sending message:", error);
    }

  };

  // 인터뷰 진행 - 메세지 보내기
  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "USER", content: input },
    ]); // 사용자가 작성한 내용 화면에 렌더링하기

    setInput("");

    try {
      console.log(sessionId);
      const res = await axiosAPI.post('/ai/interview/continue',
        {
          sessionId: sessionId,
          content: input
        }
      );

      console.log("재응답 : ", res);
      const { role, content, terminated } = res.data;

      // 인터뷰 종료
      if (role == 'SYSTEM' || terminated) {
        setIsStarted(false);
        localStorage.removeItem("interviewSession");

        setMessages((prev) => [
          ...prev,
          { role: "AI", content: content },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: role, content: content },
      ]); // ai가 답변한 내용 화면에 렌더링

    } catch (error) {
      console.error("인터뷰 진행 중 에러 발생:", error);

    } finally {
      setIsLoading(false);
    }

  };

  // 엔터 눌렀을 때 전송
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 줄바꿈 막기
      handleSend();       // 전송
    }
  };

  // 재시작 버튼 눌렀을 때
  const handleRestart = () => {
    setSessionId(null);
    setSelectedPosition(null);
    location.href = "/interview";
  }

  /* 직무 선택 화면 */
  if (!selectedPosition || !sessionId) {
    return (
      <section className="max-w-3xl mx-auto pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">
          지원 직무를 선택하세요
        </h2>
        <p className="text-slate-600 mb-10">
          선택한 직무에 맞춰 AI 면접이 진행됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(POSITION_LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => startInterview(key)}
              className="p-6 rounded-xl border bg-white hover:border-blue-500 hover:shadow-md transition"
            >
              <p className="text-lg font-semibold text-slate-800">
                {label}
              </p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  /* 대화형 면접 화면 */
  return (
    <section className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">
        AI 모의면접 · {POSITION_LABEL[selectedPosition]}
      </h2>

      {/* 채팅 영역 */}
      <div ref={bottomRef} className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl border">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
        
        {/* 재시작 버튼 */}
        {!isStarted && <button onClick={handleRestart}
        className="p-3 text-lg items-center justify-center w-full flex border rounded-lg text-white bg-blue-600 hover:bg-blue-700">재시작</button>}
      </div>
      
      {/* 입력 영역 */}
      <div className="mt-4 flex gap-2">
        <textarea
          disabled={isStarted ? false : true}
          className="flex-1 resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStarted ? "답변을 입력하세요. 만약 종료를 원하면 '면접 종료'를 입력하세요." :
            "면접이 종료되었습니다. 새로운 시작을 원하시면 재시작 버튼을 눌러주세요"
          }
        />
        <button
          onClick={handleSend} disabled={!isStarted || isLoading}
          className={`px-6 text-white rounded-lg ${(!isStarted || isLoading) ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </div>
    </section>
  );
}
