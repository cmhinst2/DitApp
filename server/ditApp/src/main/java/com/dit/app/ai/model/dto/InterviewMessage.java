package com.dit.app.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewMessage {
	private int messageId;
	private String sessionId;
	private String role;
	private String content;
	private String position; // 사용자가 선택한 개발 포지션
	private String createdAt;
	private boolean terminated; // AI의 강제 종료 여부
}
