package com.dit.app.ai.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;

@Mapper
public interface InterviewMapper {

	int insertInterviewSession(InterviewSessions interviewSessions);

	int insertInteviewMessage(InterviewMessage interviewMessage);

	List<InterviewMessage> selectAllMessageBySessionId(InterviewSessions sessionData);

	int completeInterviewSession(String memberSessionId);

	List<InterviewSessions> selectInterviewHistory(Map<String, Object> params);

	int insertFeedback(Map<String, Object> feedbackData);

	int checkAlreadyFeedback(String sessionId);

	String selectFeedback(String string);
	
}
