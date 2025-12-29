import { useEffect, useRef, useState } from "react";
import Message from "../components/Messages";
import axios from "axios";

const ROLE_LABEL = {
  frontend: "프론트엔드 개발자",
  backend: "백엔드 개발자 (Java)",
  fullstack: "풀스택 개발자",
};

export default function InterviewPage() {
  const sessionId = "user-01";
  const [selectedRole, setSelectedRole] = useState(null);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "안녕하세요. 자기소개를 해주세요.",
    },
  ]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 면접 시작(포지션 정함)
  const startInterview = async (role) => {

    try {
      const res = await axios.post('http://localhost/ai/position', {
        sessionId: sessionId, position: ROLE_LABEL[role]
      });

      setSelectedRole(role);

      setMessages([
        {
          role: "ai",
          content: res.data,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);

    }

  };

  // 메세지 보내기(인터뷰중)
  const handleSend = async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
    ]); // 사용자가 작성한 내용

    setInput("");

    try {
      const res = await axios.post('http://localhost/ai/interview',
        {
          sessionId: sessionId,
          message: input
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: res.data },
      ]); // ai가 답변한 내용

    } catch (error) {
      console.error("Error sending message:", error);

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

  /* 직무 선택 화면 */
  if (!selectedRole) {
    return (
      <section className="max-w-3xl mx-auto pt-32 text-center">
        <h2 className="text-2xl font-bold mb-4">
          지원 직무를 선택하세요
        </h2>
        <p className="text-slate-600 mb-10">
          선택한 직무에 맞춰 AI 면접이 진행됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(ROLE_LABEL).map(([key, label]) => (
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
        AI 모의면접 · {ROLE_LABEL[selectedRole]}
      </h2>

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-xl border">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="mt-4 flex gap-2">
        <textarea
          className="flex-1 resize-none border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="답변을 입력하세요"
        />
        <button
          onClick={handleSend} disabled={isLoading}
          className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isLoading ? '전송 중...' : '전송'}
        </button>
      </div>
    </section>
  );
}
