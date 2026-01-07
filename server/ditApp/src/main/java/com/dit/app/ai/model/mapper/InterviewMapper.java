package com.dit.app.ai.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;

@Mapper
public interface InterviewMapper {

	int insertInterviewSession(InterviewSessions interviewSessions);

	int insertInteviewMessage(InterviewMessage interviewMessage);

	List<InterviewMessage> selectAllMessageBySessionId(String sessionId);

	int completeInterviewSession(String memberSessionId);
	
}
