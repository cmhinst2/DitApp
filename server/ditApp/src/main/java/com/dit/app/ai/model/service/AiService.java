package com.dit.app.ai.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.messages.Message;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;

public interface AiService {

	/** 포지션 선택(AI 면접 시작)
	 * @param interviewSessions
	 * @return
	 */
	InterviewMessage selectPosition(InterviewSessions interviewSessions) throws Exception ;

	/** 면접 대화 진행
	 * @param interviewMessage
	 * @return
	 */
	InterviewMessage continueInterview(InterviewMessage interviewMessage) throws Exception ;

	/** 지난 인터뷰 AI 피드백 받기
	 * @param sessionData
	 * @return
	 */
	Map<String, Object> feedBackInterview(InterviewSessions sessionData) throws Exception ;


}
