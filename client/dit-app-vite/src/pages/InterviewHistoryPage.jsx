import { useEffect, useRef, useState } from "react";
import axiosAPI from "../api/axiosInterceptor";
import { Badge, HistoryLoader, MoreLoader } from "../components/Assets";

export const InterviewHistory = () => {
  // 로그인한 사용자의 지난 인터뷰 목록(진행중, 종료 모두)
  const [interviewList, setInterviewList] = useState([]);
  const [page, setPage] = useState(1);             // 현재 페이지
  const [hasMore, setHasMore] = useState(true);    // 더 가져올 데이터가 있는지
  const [filter, setFilter] = useState('ALL'); // ALL, COMPLETED, IN_PROGRESS
  const [order, setOrder] = useState('latest'); // 조회 정렬 방법(latest, oldest)
  const [isLoading, setIsLoading] = useState(false);

  const observerTarget = useRef(null); // 관찰 대상 (목록 맨 아래)
  const isFetching = useRef(false); // 통신 중인지 즉시 체크하는 플래그

  const loginMember = JSON.parse(localStorage.getItem("loginMember"));

  // 인터뷰 기록 조회하기
  const getInterviews = async (pageNum) => {
    if (isFetching.current || isLoading) return; // 이미 로딩중이면 return

    isFetching.current = true; // 통신 시작 직전 true 설정
    setIsLoading(true);
    try {
      const response = await axiosAPI.get(`/ai/interview/history/${loginMember.memberNo}`, {
        params: {
          page: pageNum,
          filter: filter,
          order: order,
        }
      });
      const newData = response.data;
      console.log("응답 데이터:", newData);

      if (newData.length === 0) {
        setHasMore(false); // 더 이상 가져올 데이터 없음
      } else {
        setInterviewList((prev) => [...prev, ...newData]);
      }

    } catch (error) {
      console.error("지난 인터뷰 목록 조회 중 오류 발생", error);
    } finally {
      setIsLoading(false);
      isFetching.current = false; // 통신 완료 후 해제
    }
  }

  // 정렬 및 필터 변경 시 초기화
  useEffect(() => {
    console.log('1. 필터 변경됨');
    setInterviewList([]); // 기존 목록 비우기
    setHasMore(true);    // 다시 데이터가 있다고 가정

    if (page === 1) {  // 페이지가 실제로 1일때 고정값 1 전달하여 fetch
      getInterviews(1);
    } else {        // 페이지가 1이 아닐땐 변경하도록 예약
      setPage(1);  // 페이지를 1로 초기화 (예약 - 바로 변경 X)
    }
    window.scrollTo(0, 0);
  }, [order, filter]);   // 정렬이나 필터가 바뀌면 실행

  // 페이지 번호(page)가 바뀔 때만 fetch 요청하는 로직
  useEffect(() => {
    if (page > 0) {
      getInterviews(page);
    }
  }, [page]);

  // 관찰 로직
  useEffect(() => {
    // 로딩 중이거나 더 가져올 게 없으면 관찰 중단
    if (!observerTarget.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 한 번만 실행되도록 isLoading 조건 추가
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect(); // 언마운트 시 관찰 종료

  }, [hasMore, isLoading, interviewList]);

  const removeEndTag = (text) => {
    if(text == null) return;
    return text.replace('[END_INTERVIEW]', '').trim();
  }

  // 인터뷰진행 페이지로 이동
  const handleInterviewCard = (sId, position, stat) => {
    let replacePosition;
    if (position === '프론트엔드 개발자') {
      replacePosition = 'frontend'
    } else if (position === '백엔드 개발자 (Java)') {
      replacePosition = 'backend'
    } else { replacePosition = 'fullstack' };

    const interviewStorageData = { 'currentSessionId': sId, 'position': replacePosition, 'end': (stat == 'N') ? false : true };
    localStorage.setItem("interviewSession", JSON.stringify(interviewStorageData));
    if(stat == 'N') {
      location.href = "/interview";
    } else {
      location.href = "/interview/feedback"
    }
    
  }


  if (isLoading && interviewList.length === 0) return <HistoryLoader />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FilterHeader filter={filter} setFilter={setFilter} />
      <header className="mb-8 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">인터뷰 기록 조회</h1>
          <p className="text-slate-500 text-sm mt-1">일주일 이내에 진행한 인터뷰를 이어서 진행하거나 피드백을 확인할 수 있습니다.</p>
        </div>
        <div className="relative flex items-center">
          <select className="appearance-none w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 pr-10 shadow-sm 
               focus:outline-none focus:ring-0 focus:border-slate-400 transition-all cursor-pointer"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
          >
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      <div className="grid gap-3">
        {interviewList.map((interview, index) => (
          <div
            key={interview.memberNo + index}
            onClick={() => handleInterviewCard(interview.sessionId, interview.position, interview.status)}
            className="h-[100px] group flex items-center justify-between p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex flex-col gap-1 basis-4/5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  {interview.position}
                </span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-400">{interview.createdAt}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                {removeEndTag(interview.lastMessage) || "대화 내용이 없습니다."}
              </h3>
            </div>

            <div className="flex items-center gap-4 basis-1/5">
              {/* 상태 배지 */}
              {interview.status === "Y" ?
                <Badge title="종료" color='red' /> : <Badge title="진행 중" color='green' />
              }
            </div>
          </div>
        ))}
      </div>
      <div ref={observerTarget} className="h-10 w-full flex justify-center items-center">
        {isLoading && <MoreLoader />}
        {!hasMore && <p className="mt-5 text-slate-400 text-sm">모든 기록을 불러왔습니다.</p>}
      </div>
    </div>
  )
}


const FilterHeader = ({ filter, setFilter }) => {
  return (
    <div className="flex gap-2 mb-6 p-1 bg-slate-100 w-fit rounded-lg">
      <button
        onClick={() => setFilter('ALL')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
      >
        전체
      </button>
      <button
        onClick={() => setFilter('COMPLETED')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'COMPLETED' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
      >
        종료-피드백
      </button>
      <button
        onClick={() => setFilter('IN_PROGRESS')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filter === 'IN_PROGRESS' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'
          }`}
      >
        진행 중
      </button>
    </div>
  )
}