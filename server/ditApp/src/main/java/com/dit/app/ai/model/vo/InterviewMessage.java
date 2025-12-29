package com.dit.app.ai.model.vo;

import com.google.auto.value.AutoValue.Builder;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewMessage {
	private String sessionId;
	private String position;
	private String message;
}
