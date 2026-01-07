package com.dit.app.ai.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.chat.messages.Message;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;
import com.dit.app.ai.model.service.AiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("ai")
@Slf4j
public class AiController {

	private final AiService aiService;

	// 면접 시작(포지션 세팅)
	@PostMapping("interview/position")
	public InterviewMessage selectPosition(@RequestBody InterviewSessions interviewSessions) throws Exception {
		// memberNo, position 세팅 중
		String sessionId = UUID.randomUUID().toString(); // 시작할때마다 세션 새로 만듦
		interviewSessions.setSessionId(sessionId);
		interviewSessions.setStatus("N"); // 새로 진행중

		return aiService.selectPosition(interviewSessions);
	}

	// 인터뷰 진행
	@PostMapping("interview/continue")
	public InterviewMessage continueInterview(@RequestBody InterviewMessage interviewMessage) throws Exception {
			return aiService.continueInterview(interviewMessage);
	}

	// 기존 인터뷰 불러오기
	@GetMapping("interview/history/{sessionId}")
	public List<InterviewMessage> loadInterviewHistory(@PathVariable("sessionId") String sessionId) {
		// {sessionId : '', content: '', role : ''} 형태 List로 반환
		return aiService.loadInterviewHistory(sessionId);
	}

}
