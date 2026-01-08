# 내 손안의 AI 취업 코치 Dit(Do it) App
### AI 커리어 코칭 및 인터뷰 시뮬레이션 플랫폼

DitApp은 **Gemini 2.0 Flash**를 활용하여 취업 준비생들에게 정교한 모의면접 환경과 
데이터 기반의 심층 피드백을 제공하는 인텔리전트 커리어 솔루션입니다.


![나의 취업 메이트 Dit - Chrome 2026-01-08 16-01-08](https://github.com/user-attachments/assets/5555587b-7be0-4e83-8b1d-d19d23489060)


---

## Tech Stack

### Client
- **Framework:** React (Vite)
- **State Management:** Hooks & Context API
- **Network:** Axios (Interceptors) 
- **Social Login:** Kakao OAuth 2.0
- **Styling:** CSS Modules / Tailwind CSS

### Server
- **Framework:** Spring Boot 3.5.9
- **Language:** Java
- **Database:** Oracle

### AI Engine
- **Model:** Google Gemini 2.0 Flash
- **Key Feature:** 실시간 대화 맥락 유지 및 면접 피드백 생성


---


## Key Features

### 1. AI 모의면접 시스템 (Completed)
- **세션 유지 및 재개**: `localStorage`와 `sessionID`를 결합하여 진행 중인 면접 세션이 있다면 끊김 없이 이어하기 가능.
- **포지션 커스터마이징**: 진행 내역이 없을 경우 사용자가 원하는 직무(포지션)를 선택하여 면접 시작.
- **지능형 종료 로직**:
  - **AI 자동 종료**: 질문 고갈, 부적절한 언어 사용(욕설/비방) 시 AI가 스스로 판단하여 세션 종료.
  - **사용자 종료**: 사용자가 '면접 종료'를 입력하면 즉시 세션 만료.
- **심층 피드백 제공**: 면접 종료 후 전체 대화 내용을 분석하여 보완점과 총평 제공.

### 2. 보안 및 UX 최적화 (Completed)
- **토큰 기반 인증 관리**: 서비스 접속 시 쿠키의 `accessToken` 만료 여부를 실시간으로 검증하여, 만료 시 자동 로그아웃 및 클라이언트 상태값을 초기화.
- **UI 시각적 피드백**: AI 대답 대기 시간 및 페이지 전환 시 **Spinner**를 적용하여 사용자 경험 개선.

### 3. 진행 중인 기능 (In Progress)
- **History 관리**: 최근 일주일 내 진행된 미종료 인터뷰 이어하기 기능.
- **AI 보완 가이드**: 종료된 인터뷰 데이터를 기반으로 부족한 역량을 점검받고 학습 방향을 제시받는 기능.
- **자동 정리 스케줄러**: 일주일이 지난 미종료 세션을 DB 레벨에서 자동으로 종료 처리하는 스케줄러 구축 중.


---


## Issue Resolved (시스템 안정성 및 사용자 경험(UX) 개선 리포트)

### [Server] Spring Boot - AI 페르소나 유지 이슈
- **문제**: 대화가 길어질수록 AI가 초기에 설정한 면접관 페르소나를 잊어버리는 현상 발생.
- **원인**: 세션별 대화 기록 리스트(`List<Message>`)에 AI의 역할을 규정하는 `SystemMessage`가 누락되어 맥락이 손실됨.
- **해결**: 모든 API 호출 시 대화 리스트의 **0번 인덱스에 SystemMessage를 고정 삽입**하도록 로직을 수정하여 대화 전 과정에서 일관된 페르소나를 유지하도록 조치.

### [Client] React - API 중복 호출 이슈
- **문제**: `useEffect` 내에서 `fetch` 진행 시 API가 2번씩 발생하는 문제.
- **원인**: React의 `StrictMode`가 개발 환경에서 컴포넌트 마운트/언마운트를 반복하며 발생하는 의도된 동작.
- **해결**: `useRef`를 활용한 실행 플래그(Flag)를 구현했습니다. `useRef`는 값이 변해도 리렌더링을 유발하지 않으므로, 첫 실행 후 값을 즉시 변경하여 개발 환경에서의 불필요한 이중 호출을 차단.

### [Client] 상태 초기화 동기화 이슈
- **문제**: 토큰 만료 시 로그아웃 처리가 되어도 이전 사용자의 데이터(이름, 이미지 등)가 화면에 남아있는 현상.
- **원인**: `localStorage` 삭제와 별개로 React State가 리렌더링 전까지 이전 값을 유지함.
- **해결**: 토큰 검증 로직에서 인증 실패 시 상태값(State)을 명시적으로 초기화하도록 수정하여 새로고침 없이도 즉각적인 UI 반영이 되도록 개선.
