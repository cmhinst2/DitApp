export default function Message({ role, content }) {
  const isAI = role === "AI";

  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[70%] p-4 rounded-xl text-sm leading-relaxed
          ${
            isAI
              ? "bg-blue-50 text-slate-800"
              : "bg-white border text-slate-900"
          }
        `}
      >
        {isAI && (
          <p className="mb-1 text-xs text-blue-600 font-semibold">
            AI 면접관
          </p>
        )}
        {content}
      </div>
    </div>
  );
}
