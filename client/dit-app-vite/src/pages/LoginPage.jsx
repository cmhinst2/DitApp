const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
const REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;
import kakaoIcon from '../assets/kakao_icon.png';

const KAKAO_AUTH_URL =
  `https://kauth.kakao.com/oauth/authorize` +
  `?client_id=${KAKAO_REST_API_KEY}` +
  `&redirect_uri=${REDIRECT_URI}` +
  `&response_type=code`;

export default function LoginPage() {
  const handleKakaoLogin = () => {
    let kakaoUrl = KAKAO_AUTH_URL;
    const lastLogout = localStorage.getItem("lastLogoutTime");
    const ONE_HOUR = 60 * 60 * 1000;  // 1시간 
  
    if (lastLogout && (Date.now() - parseInt(lastLogout) > ONE_HOUR)) {
      // 로그아웃 한지 1시간이 지났다면 강제로 ID/PW를 입력하게 함
      kakaoUrl += "&prompt=login";
    }

    window.location.href = kakaoUrl;
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Dit 로그인</h1>

        <button
          onClick={handleKakaoLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-black py-3 rounded-lg font-semibold hover:brightness-95"
        >
          <img
            src={kakaoIcon}
            alt="kakao"
            className="w-5 h-5"
          />
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
}
