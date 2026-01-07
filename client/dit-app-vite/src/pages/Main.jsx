import { Link } from "react-router-dom";

export default function Main() {

  return (
    <section className="max-w-3xl mx-auto pt-32 text-center flex flex-col">
      <Link to={'/trends'} className="text-xl cursor-pointer mb-5 font-bold border-2 border-blue-500 rounded-lg p-4 transition-all duration-200 hover:bg-blue-500 hover:text-white">
        개발 트렌드
      </Link>
      <Link to={'/interview'} className="text-xl cursor-pointer mb-5 font-bold border-2 border-blue-500 rounded-lg p-4 transition-all duration-200 hover:bg-blue-500 hover:text-white">
        AI 모의면접
      </Link>
      <Link to={'/codereview'} className="text-xl cursor-pointermb-5 font-bold border-2 border-blue-500 rounded-lg p-4 transition-all duration-200 hover:bg-blue-500 hover:text-white">
        AI 코드리뷰
      </Link>
    </section>
  )

}