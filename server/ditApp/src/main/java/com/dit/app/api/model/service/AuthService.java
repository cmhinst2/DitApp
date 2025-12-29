package com.dit.app.api.model.service;

import com.dit.app.api.model.dto.Member;

public interface AuthService {

	Member kakaoLogin(Member member);

	int kakaoLogout(String memberEmail);

	String getAccessToken(String memberEmail);

}
