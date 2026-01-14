export default function Message({ role, content }) {
  const isAI = role === "AI";


  const removeEndTag = (text) => {
    if (text == null) return;
    return text.replace('[END_INTERVIEW]', '').trim();
  }


  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`whitespace-pre-wrap break-words max-w-[70%] p-4 rounded-xl text-sm leading-relaxed
          ${isAI
            ? "bg-blue-50 text-slate-800"
            : "bg-white border text-slate-900"
          }
        `}
      >
        {isAI && (
          <p className="mb-1 text-xs text-blue-600 font-semibold">
            면접관 [조코더]
          </p>
        )}
        {removeEndTag(content)}
      </div>
    </div>
  );
}
