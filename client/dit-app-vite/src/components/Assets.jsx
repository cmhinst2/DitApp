import chocoder from '../assets/chocoder_v.png';

// Interview 페이지 이동 스피너
export const InterviewSpinner = () => {
  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center h-48 w-48 mb-6">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-20"></span>
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin"></div>
        <div className="relative h-36 w-36 rounded-full overflow-hidden">
          <img
            src={chocoder}
            alt="조코더 면접관"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-800 animate-pulse tracking-tight">
          면접 세션을 불러오는 중입니다
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          조코더 면접관이 서류를 검토하고 있습니다.<br />잠시만 기다려 주세요.
        </p>
      </div>
    </div>
  );
}

// InterviewHistoryPage 페이지 이동 스피너
export const HistoryLoader = () => {
  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center h-48 w-48 mb-6">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-20"></span>
        <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin"></div>
        <div className="relative h-36 w-36 rounded-full overflow-hidden">
          <img
            src={chocoder}
            alt="조코더 면접관"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-slate-700 tracking-tight">
          지난 기록 불러오는 중
        </h3>
        <p className="text-sm text-slate-400 mt-1 animate-pulse">
          조코더가 데이터베이스에서 면접 파일을 찾는 중입니다...
        </p>
      </div>
    </div>
  );
};

// InterviewHistoryPage의 더 불러오기 스피너
export const MoreLoader = () => {
  return (
    <div className="h-full bg-slate-50 flex flex-col items-center justify-center">
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-slate-700 tracking-tight">
          더 불러오는 중...
        </h3>
      </div>
    </div>
  );
}

// 뱃지
export const Badge = ({title, color}) => (
  <div className={`ml-auto flex items-center gap-2 px-3 py-1.5 bg-${color}-50 text-${color}-700 border border-${color}-200 rounded-full`}>
    <span className={`w-2 h-2 bg-${color}-500 rounded-full animate-pulse`}></span>
    <span className="text-xs font-bold">{title}</span>
  </div>
);