package com.dit.app.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSessions {
	private String sessionId;
	private String position;
	private String status;
	private String createdAt;
	private int memberNo;
	
	private String lastMessage;
}
