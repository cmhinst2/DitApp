package com.dit.app.ai.model.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

import com.dit.app.ai.model.mapper.MessageMapper;
import com.dit.app.ai.model.vo.InterviewMessage;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

	private final ChatModel chatModel;
	private final MessageMapper messageMapper;

	// 사용자별 대화 기록을 저장할 맵 (실제 서비스에서는 DB나 Redis 권장)
	private final Map<String, List<Message>> chatHistory = new ConcurrentHashMap<>();

	// 1. 면접 시작 (초기화)
	public String startInterview(InterviewMessage interviewMessage) {

		List<Message> messages = new ArrayList<>();

		// 페르소나 설정
		String instruction = String.format(
				"넌 %s 테크리더야. 신입 면접관으로서 아주 날카롭고 구체적으로 질문해줘. "
						+ "요구사항은 아래와 같아. " + 
						"1. 전문적이고 날카로운 질문을 던져줘."
						+ "2. 가끔 답변에 대한 꼬리 질문을 던져줘. "
						+ "단, 매번 꼬리질문으로 진행하지 말고 다른 주제의 질문을 하기도 해야해."
						+ "3. 기술 질문을 10개정도 마치면, 인성 면접을 약 5개 정도 진행해줘." + 
						"4. 만약 면접자가 너무 기본이 안되어있다면 지적 또는 면접 진행을 멈춰도 돼.",
				interviewMessage.getPosition());

		messages.add(new SystemMessage(instruction));
		// SystemMessage - 페르소나 주입용 객체

		// 첫 질문 유도
		String firstPrompt = String.format("안녕하세요. %s 면접을 시작하겠습니다. "
				+ "자기소개부터 해주세요.", interviewMessage.getPosition());
		
		messages.add(new UserMessage(firstPrompt));
		// UserMessage - 사용자 메시지

		chatHistory.put(interviewMessage.getSessionId(), messages);

		String aiResponse = getAiResponse(messages);
		
		messages.add(new AssistantMessage(aiResponse));
		// AssistantMessage - AI가 대답한 내용

		return aiResponse;
	}

	// 2. 답변 주고받기 (연속 대화)
	public String continueInterview(InterviewMessage interviewMessage) {
		List<Message> messages = chatHistory.get(interviewMessage.getSessionId());
		if (messages == null)
			return "세션이 만료되었습니다. 다시 시작해주세요.";

		// 사용자의 답변 추가
		messages.add(new UserMessage(interviewMessage.getMessage()));

		// AI 응답 획득
		String aiResponse = getAiResponse(messages);

		// AI의 응답도 기록에 추가 (그래야 다음 질문 때 AI가 본인이 한 말을 기억함)
		messages.add(new AssistantMessage(aiResponse));

		return aiResponse;
	}

	// 
	private String getAiResponse(List<Message> messages) {
		// 1. Prompt 객체 생성
	    // 지금까지 쌓인 메시지 리스트(SystemMessage, UserMessage, AssistantMessage)를 
	    // AI 모델이 이해할 수 있는 하나의 Prompt 뭉치로 포장
		Prompt prompt = new Prompt(messages);
		// 2. AI 호출 및 응답 획득
		return chatModel.call(prompt) // AI에게 메시지 뭉치를 보내고 응답(ChatResponse)을 받음
				.getResult() // 응답 중에서 '첫 번째 결과(Generation)'를 선택
				.getOutput() // 결과 내부에 포함된 'AI 메시지(AssistantMessage)' 객체를 꺼냄
				.getText(); // 메시지 객체 안의 '순수 텍스트(String)'만 추출 
	}

}
