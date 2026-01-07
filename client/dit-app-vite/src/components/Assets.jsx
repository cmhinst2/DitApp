import chocoder from '../assets/chocoder_v.png';

export const Spinner = () => {
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