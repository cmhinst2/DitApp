
import { Link, NavLink } from "react-router-dom";
import axiosAPI from "../api/axiosInterceptor.js";

// 헤더
export function Header() {
  const loginMember = JSON.parse(localStorage.getItem("loginMember"));

  return (
    <header className="top-0 left-0 w-full h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-50">
      <Link to="/">
        <h1 className="title text-xl font-semibold text-blue-600">Dit (Do it)</h1>
      </Link>

      {loginMember ?
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{loginMember.memberName || '사용자'}</p>
          </div>

          {/* 프로필 이미지 컨테이너 */}
          <div className="relative w-10 h-10 overflow-hidden bg-slate-100 rounded-full ring-2 ring-slate-50 group-hover:ring-blue-100 transition-all">
            {loginMember.memberProfile ? (
              <img
                src={loginMember.memberProfile}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              /* 이미지가 없을 때 보여줄 기본 아이콘 */
              <svg className="absolute w-12 h-12 text-slate-300 -left-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
              </svg>
            )}
          </div>
        </div> : <></>
      }
    </header>
  );
}

// 사이드메뉴바
export function Sidebar({ setIsLogin }) {
  const memberCode = JSON.parse(localStorage.getItem("loginMember")).memberEmail;

  // 서버에서 카카오 로그아웃 호출
  const handleLogout = async () => {
    try {
      const resp = await axiosAPI.post("/api/auth/kakao/logout", { memberEmail: memberCode });

      if (resp.data == 0) {
        alert("DB 로그아웃 업데이트 오류 발생 [관리자 문의]")
        return;
      }

    } catch (error) {
      console.error("카카오 - 서버 로그아웃 중 예외 발생, 로그아웃 처리는 진행됨")
    } finally {
      localStorage.clear();
      localStorage.setItem("lastLogoutTime", Date.now().toString());
      setIsLogin(null);
    }
  }

  return (
    <aside className="sticky top-0 flex flex-col basis-1/6 w-64 bg-slate-50 border-r border-slate-200 pt-10 pb-10 px-4">
      <ul className="space-y-4 text-slate-600 border-b pb-5 mb-5">
        <li className="font-semibold text-slate-800">메뉴</li>
        <SideMenu path={"/trends"} title={"개발 트렌드"} />
        <SideMenu path={"/interview"} title={"AI 모의면접"} />
        <SideMenu path={"/review"} title={"AI 코드리뷰"} />
      </ul>

      <ul className="space-y-4 text-slate-600 border-b pb-5 mb-5">
        <li className="font-semibold text-slate-800">내 메뉴</li>
        <SideMenu path={"/interview/history"} title={"내 모의면접 기록"} />
        <SideMenu path={"/review/history"} title={"내 코드리뷰 기록"} />
      </ul>
      
      <ul className="mt-auto">
        <li onClick={handleLogout}
          className="text-slate-800 cursor-pointer text-center hover:text-blue-600 hover:underline">로그아웃</li>
      </ul>
    </aside>
  );
}

// 푸터
export function Footer() {
  return (
    <footer className="w-full h-[3.5rem] bg-white border-t border-slate-200 flex items-center justify-center text-sm text-slate-500">
      © 2025 Dit. All rights reserved.
    </footer>
  );
}

// 사이드 메뉴
const SideMenu = ({path, title}) => {
  return (
    <div className="m-2">
      <NavLink
        to={path}
        end
        className={({ isActive }) =>
          `inline-block px-4 py-2 transition-all duration-200 rounded-md ${isActive
            ? "text-blue-600 bg-blue-100 font-bold flex"
            : "text-gray-700 hover:text-white hover:bg-blue-500 flex"
          }`
        }
      >
        {title}
      </NavLink>
    </div>
  )
}