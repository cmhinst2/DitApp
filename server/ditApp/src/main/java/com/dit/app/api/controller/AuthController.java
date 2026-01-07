package com.dit.app.api.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClient;

import com.dit.app.api.model.dto.Member;
import com.dit.app.api.model.service.AuthService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/auth")
//@CrossOrigin(origins = "http://localhost:5173") // React 주소 허용
@RequiredArgsConstructor
@Slf4j
public class AuthController {

	private final AuthService authService;
	
	// 첫 접속 시 로그인 상태(accessToken 유효 여부) 확인
	@GetMapping("me")
	public ResponseEntity<String> checkAuth() {
		return ResponseEntity.ok("로그인 상태 유효함");
	}

	// 카카오 로그인
	@PostMapping("kakao/login")
	public ResponseEntity<Member> kakaoLogin(@RequestBody Member member) {

		Member loginMember = authService.kakaoLogin(member);
		ResponseCookie cookie = null;

		if (loginMember != null) {
			cookie = ResponseCookie.from("accessToken", member.getAccessToken())
					.httpOnly(true) // JS에서 접근 불가 (XSS 방지)
					.secure(true)
					.path("/")
					.maxAge(60) // 1시간
					.sameSite("Strict")
					.build();
		}

		return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(loginMember);
	}

	// 로그아웃
	@PostMapping("kakao/logout")
	public ResponseEntity<Integer> kakaoLogout(@RequestBody Member member) {
		int result = 0; // 최종 결과 저장용 변수

		String memberEmail = member.getMemberEmail();

		// pw에 저장된 accessToken 조회
		String accessToken = authService.getAccessToken(memberEmail);
		
		WebClient webClient = WebClient.create();

		if (accessToken != null) {
			// 카카오 API 서버에 로그아웃 요청 (토큰 만료)
			
			try {
				webClient.post()
	            .uri("https://kapi.kakao.com/v1/user/logout")
	            .header("Authorization", "Bearer " + accessToken)
	            .retrieve() // 응답 추출 시작
	            .bodyToMono(String.class) // 응답 바디를 String으로 변환
	            .block(); 
				
			} catch (HttpClientErrorException.Unauthorized e) { // 토큰 만료 시 401에러
				log.debug("[만료된 토큰] 카카오 세션 종료: {}", memberEmail);
			} catch (Exception e) {
				log.error("카카오 API 호출 중 오류 발생: {}", e.getMessage());
			}
		}
		
		// 토큰 만료 여부와 상관없이 서비스의 DB의 토큰 정보 업데이트
		result = authService.kakaoLogout(memberEmail);

		return ResponseEntity.ok(result);
	}
	
	@GetMapping("test")
	public String test() {
		log.info("axios 유효 요청 테스트");
		return "테스트";
	}

}
