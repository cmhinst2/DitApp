package com.dit.app.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
	private int memberNo;
	private String memberEmail;
	private String memberPw;
	private String memberName;
	private String loginType;
	private String memberProfile;
	private String accessToken;
	private String refreshToken;
}
