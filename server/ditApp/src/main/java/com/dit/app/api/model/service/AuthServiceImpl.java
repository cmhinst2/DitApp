package com.dit.app.api.model.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dit.app.api.model.dto.Member;
import com.dit.app.api.model.mapper.AuthMapper;

import lombok.RequiredArgsConstructor;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService{
	
	private final AuthMapper mapper;
	
	@Override
	public Member kakaoLogin(Member member) {
		int result = 0;
		Member loginMember = null;
		
		// 회원 가입이 되어있는지 조회를 먼저 함
		result = mapper.selectMember(member.getMemberEmail());
		
		// 회원가입 조회 결과가 없으면 insert(가입 시키기)
		if(result == 0) {
			result = mapper.insertKakaoMember(member);
			
		} else { // 회원가입을 기존에 했다면 현재 accessToken/refreshToken 수정
			result = mapper.updateKakaoMemberToken(member);
		}
		
		// insert/update에 성공했다면 회원 정보 조회하기
		if(result != 0) {
			 loginMember = mapper.kakaoLogin(member);
		}
		
		return loginMember;
	}
	
	@Override
	public String getAccessToken(String memberEmail) {
		return mapper.getAccessToken(memberEmail);
	}
	
	@Override
	public int kakaoLogout(String memberEmail) {
		return mapper.kakaoLogout(memberEmail);
	}
}
