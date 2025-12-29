package com.dit.app.ai.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dit.app.ai.model.service.GeminiService;
import com.dit.app.ai.model.vo.InterviewMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("ai")
@Slf4j
public class GoogleAiController {
	
	private final GeminiService geminiService;
	
	// 면접 시작(포지션 세팅)
	@PostMapping("position")
    public String selectPosition(@RequestBody InterviewMessage interviewMessage) {
        return geminiService.startInterview(interviewMessage);
    }
	
	// 인터뷰 진행
	@PostMapping("interview")
    public String startInterview(@RequestBody InterviewMessage interviewMessage) {
        return geminiService.continueInterview(interviewMessage);
    }

	
}
