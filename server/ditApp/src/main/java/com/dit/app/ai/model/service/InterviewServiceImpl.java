package com.dit.app.ai.model.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;
import com.dit.app.ai.model.mapper.InterviewMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@Slf4j
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {
	
	private final InterviewMapper interviewMapper;

	// 이전 면접 대화 불러오기
	@Override
	public List<InterviewMessage> loadInterview(InterviewSessions sessionData) {
		return interviewMapper.selectAllMessageBySessionId(sessionData);
	}

	// 지난 인터뷰 기록 모두 조회
	@Override
	public List<InterviewSessions> selectInterviewHistory(String memberNo, Map<String, Object> paramMap) {
		int page = Integer.parseInt(String.valueOf(paramMap.get("page")));
		
		int limit = 10; // 한 페이지에 10개씩
		int offset = (page - 1) * limit;

		paramMap.put("memberNo", memberNo);
		paramMap.put("offset", offset);
		paramMap.put("limit", limit);

		return interviewMapper.selectInterviewHistory(paramMap);
	}
	
	
}
