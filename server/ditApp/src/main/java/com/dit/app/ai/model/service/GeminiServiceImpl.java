package com.dit.app.ai.model.service;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StreamUtils;

import com.dit.app.ai.model.dto.InterviewMessage;
import com.dit.app.ai.model.dto.InterviewSessions;
import com.dit.app.ai.model.mapper.InterviewMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Transactional(rollbackFor = Exception.class)
@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiServiceImpl implements AiService {

	private final ChatModel chatModel;
	private final InterviewMapper interviewMapper;
	private final InterviewService interviewService;

	@Autowired
	private ResourceLoader resourceLoader;

	// system-prompt.txt에 저장된 페르소나 불러오기
	private String getPrompt() throws Exception {
		Resource resource = resourceLoader.getResource("classpath:prompts/system-prompt.txt");

		// InputStream을 String으로 변환
		return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
	}

	// feedback-prompt.txt에 저장된 페르소나 불러오기
	private String getFeedbackPrompt() throws Exception {
		Resource resource = resourceLoader.getResource("classpath:prompts/feedback-prompt.txt");

		// InputStream을 String으로 변환
		return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
	}

	// 새 면접 시작 (초기화)
	public InterviewMessage selectPosition(InterviewSessions interviewSessions) throws Exception {

		List<Message> messages = new ArrayList<>(); // 인터뷰 대화 내 기록용

		// DB에 INTERVIEW_SESSIONS 에 현재 인터뷰 세션 저장
		int result = interviewMapper.insertInterviewSession(interviewSessions);
		if (result == 0)
			return null;

		// SystemMessage - 페르소나 주입용 객체
		messages.add(new SystemMessage(getPrompt()));

		// 첫 질문 유도(AI가 사용자에게 말하도록)
		String firstPrompt = String.format("[SYSTEM] 지원자는 %s를 선택했습니다. " + "면접관님, 인사와 자기소개로 시작하여 면접을 시작하세요.",
				interviewSessions.getPosition());

		// 현재 사용자 sessionId (UUID)
		String memberSessionId = interviewSessions.getSessionId();

		// UserMessage - 사용자 메시지
		UserMessage userMsg = new UserMessage(firstPrompt);
		messages.add(userMsg);// 사용자인 척 명령내림
		saveMessage(memberSessionId, userMsg, true); // DB 저장

		// 메세지를 ai에게 전달하여 답변 반환받기
		String aiResponse = getAiResponse(messages);

		// AssistantMessage - AI가 대답한 내용
		AssistantMessage aiMsg = new AssistantMessage(aiResponse);
		messages.add(aiMsg); // 없어도 동작은 하나 일관성과 추후 즉시 재사용성을 위해 세팅함
		saveMessage(memberSessionId, aiMsg, false); // DB에 저장

		// 클라이언트에게 응답해줄 내용
		InterviewMessage responseData = InterviewMessage.builder().sessionId(memberSessionId).content(aiResponse)
				.role("AI").build();

		return responseData;
	}

	// 연속 대화 메서드
	public InterviewMessage continueInterview(InterviewMessage interviewMessage) throws Exception {

		// 현재 사용자 sessionId (UUID)
		String memberSessionId = interviewMessage.getSessionId();

		// 사용자에게 답변할 메세지 변수
		InterviewMessage responseData = null;

		// 면접 종료를 원하는지 확인
		if (interviewMessage.getContent().equals("면접 종료")) {
			int result = completeInterviewSession(memberSessionId); // DB에서 세션 상태 변경
			if (result > 0) {
				responseData = InterviewMessage.builder().sessionId(memberSessionId).content("면접이 종료 되었습니다.")
						.role("SYSTEM").build();
			}
			return responseData;
		}

		// 이전 인터뷰 내용 DB에서 로드 후 AI Message타입으로 변환
		InterviewSessions sessionData = InterviewSessions.builder().sessionId(memberSessionId).status("N").build();
		List<InterviewMessage> dbMessages = interviewService.loadInterview(sessionData);
		List<Message> history = convertToAiMessages(dbMessages);
		if (history == null)
			return null;

		// 페르소나 0번 인덱스 주입용 새 List 생성
		List<Message> messages = new ArrayList<>();

		messages.add(new SystemMessage(getPrompt())); // 기존 페르소나 주입

		// 이전 대화 내역 추가
		messages.addAll(history);

		// UserMessage - 사용자 메시지
		UserMessage userMsg = new UserMessage(interviewMessage.getContent());
		messages.add(userMsg);
		saveMessage(memberSessionId, userMsg, false); // DB 저장

		// 메세지를 ai에게 전달하여 답변 반환받기
		String aiResponse = getAiResponse(messages);

		// AssistantMessage - AI가 대답한 내용
		AssistantMessage aiMsg = new AssistantMessage(aiResponse);
		messages.add(aiMsg);
		saveMessage(memberSessionId, aiMsg, false); // DB에 저장

		// AI가 인터뷰를 종료했을 때
		if (aiResponse.contains("[END_INTERVIEW]")) {
			// DB의 인터뷰 상태를 세션 종료로 변경
			completeInterviewSession(memberSessionId);

			// 사용자에게 보여줄 때는 해당 태그를 제거하고 전달
			aiResponse = aiResponse.replace("[END_INTERVIEW]", "").trim();

			// 프런트엔드에 종료 신호를 보냄
			responseData = InterviewMessage.builder().sessionId(memberSessionId).content(aiResponse).role("AI")
					.terminated(true).build();

			return responseData;
		}

		// 클라이언트에게 응답해줄 내용
		responseData = InterviewMessage.builder().sessionId(memberSessionId).content(aiResponse).role("AI").build();

		return responseData;
	}

	// 지난 인터뷰 AI 피드백 서비스
	@Override
	public Map<String, Object> feedBackInterview(InterviewSessions sessionData) throws Exception {
		// 지난 인터뷰 기록
		List<InterviewMessage> dbMessages = interviewService.loadInterview(sessionData);
		List<Message> history = convertToAiMessages(dbMessages);
		if (history == null) return null;

		history.add(0, new SystemMessage(getFeedbackPrompt()));

		String finalRequest = "면접이 종료되었습니다. "
				+ "지금까지의 대화 내용을 바탕으로 #Guidelines 및 #Constraints에 맞춰 최종 피드백 JSON을 출력하세요.";
		history.add(new UserMessage(finalRequest));

		String feedback = getAiResponse(history).replaceAll("(?s)^.*?(\\{.*\\}).*?$", "$1");

		Map<String, Object> feedbackData = new HashMap<>();
		feedbackData.put("sessionId", sessionData.getSessionId());
		feedbackData.put("feedbackContent", feedback);

		// 이미 생성된 피드백이 있는지 확인
		int result = interviewMapper.checkAlreadyFeedback(sessionData.getSessionId());
		if(result == 0) { // 없다면 insert
			result = interviewMapper.insertFeedback(feedbackData);	
		} else { // 있다면 이전 피드백 내용 불러오기
			feedback = interviewMapper.selectFeedback(sessionData.getSessionId());
		}
		
		feedbackData.clear();

		if (result > 0) {
			feedbackData.put("interviewMessageList", dbMessages);
			feedbackData.put("feedback", feedback);
		}
		
		return feedbackData;
	}

	// DB에 인터뷰 세션 상태 업데이트
	private int completeInterviewSession(String memberSessionId) {
		return interviewMapper.completeInterviewSession(memberSessionId);
	}

	// DB에 메시지 저장
	private void saveMessage(String sessionId, Message message, boolean isFirst) {
		InterviewMessage interviewMessage = new InterviewMessage();
		interviewMessage.setSessionId(sessionId);
		interviewMessage.setContent(message.getText()); // Message 객체에서 텍스트 추출

		// Role 결정 (상황에 맞게 문자열로 변환)
		if (message instanceof UserMessage) {
			if (isFirst) { // UserMessage 타입이지만 첫번째 대화라면 FIRST으로 저장(첫 질문 유도)
				interviewMessage.setRole("FIRST");
			} else {
				interviewMessage.setRole("USER");
			}
		} else if (message instanceof AssistantMessage) {
			interviewMessage.setRole("AI");
		} else if (message instanceof SystemMessage) {
			interviewMessage.setRole("SYSTEM");
		}

		// DB 저장
		interviewMapper.insertInteviewMessage(interviewMessage);
	}

	// 이전 인터뷰 내용 DB에서 로드 후 AI Message타입으로 변환
	private List<Message> convertToAiMessages(List<InterviewMessage> dbMessages) {

		if (dbMessages.isEmpty())
			return null;

		// AI에게 전달할 Message 리스트 생성
		List<Message> messages = new ArrayList<>();

		for (InterviewMessage msg : dbMessages) {
			String role = msg.getRole();
			String content = msg.getContent();

			if ("FIRST".equals(role))
				continue;

			// Role에 따라 알맞은 객체로 변환하여 리스트에 추가
			if ("USER".equals(role)) {
				messages.add(new UserMessage(content));
			} else if ("AI".equals(role)) {
				messages.add(new AssistantMessage(content));
			} else if ("SYSTEM".equals(role)) {
				messages.add(new SystemMessage(content));
			}
		}

		return messages;
	}

	// User의 메시지 전달 및 AI 답변 반환받기
	private String getAiResponse(List<Message> messages) {

		Prompt prompt = new Prompt(messages);

		// AI 호출 및 응답 반환
		return chatModel.call(prompt) // AI에게 메시지 뭉치를 보내고 응답(ChatResponse)을 받음
				.getResult() // 응답 중에서 첫 번째 결과(Generation)를 선택
				.getOutput() // 결과 내부에 포함된 AI 메시지(AssistantMessage) 객체를 꺼냄
				.getText(); // 메시지 객체 안의 '순수 텍스트(String)'만 추출
	}

}
