package com.dit.app.api.model.mapper;

import org.apache.ibatis.annotations.Mapper;

import com.dit.app.api.model.dto.Member;

@Mapper
public interface AuthMapper {

	int selectMember(String memberEmail);

	int insertKakaoMember(Member member);

	Member kakaoLogin(Member member);

	int kakaoLogout(String memberEmail);

	int updateKakaoMemberToken(Member member);

	String getAccessToken(String memberEmail);

}
