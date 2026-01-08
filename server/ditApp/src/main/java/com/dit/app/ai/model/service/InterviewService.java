package com.dit.app.ai.model.service;

import java.util.List;
import java.util.Map;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;

public interface InterviewService {
	/** 이전 면접 대화 불러오기
	 * @param sessionId
	 * @return
	 */
	List<InterviewMessage> loadInterview(String sessionId);

	/** 지난 인터뷰 기록 모두 조회
	 * @param memberNo
	 * @return
	 */
	List<InterviewSessions> selectInterviewHistory(String memberNo, Map<String, Object> paramMap);


}
