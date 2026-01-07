package com.dit.app.common.interceptor;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthInterceptor implements HandlerInterceptor {

	// 쿠키에 accessToken이 유효한 상태인지 검사
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
		
		// 브라우저는 OPTIONS 요청에 쿠키를 담지 않기 때문에 인터셉터가 동작하여 401 던질 가능성이 큼
		// -> OPTIONS 요청은 인증 검사를 하지 않고 통과시키도록함
		if (HttpMethod.OPTIONS.matches(request.getMethod())) {
	        return true;
	    }

		Cookie[] cookies = request.getCookies();
		String token = null;

		if (cookies != null) {
			for (Cookie cookie : cookies) {
				if ("accessToken".equals(cookie.getName())) {
					token = cookie.getValue();
				}
			}
		}

		if (token == null || !isValid(token)) {
			log.debug("와쓰까");
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401 에러 전송
			return false; // 컨트롤러로 요청을 보내지 않음
		}

		return true;
	}

	// 카카오 / DB에서 토큰 유효여부에 따른 처리
	private boolean isValid(String token) {

		if (token == null || token.isEmpty()) return false;

		try {

			// 카카오 API 를 통해 토큰 유효성 검사
			WebClient webClient = WebClient.create();

			webClient.get().
			uri("https://kapi.kakao.com/v1/user/access_token_info")
			.header("Authorization", "Bearer " + token)
			.retrieve()
			.bodyToMono(String.class)
			.block(); // 동기식으로 결과 기다림

			return true; // 성공하면 유효한 토큰

		} catch (HttpClientErrorException.Unauthorized e) { // 토큰 만료 시 401에러
			log.error("카카오 토큰 만료 또는 권한 없음 (401)");
			return false;

		} catch (WebClientResponseException e) {
			log.error("카카오 API 호출 에러 (상태코드: {}): {}", e.getStatusCode(), e.getMessage());
			return false; // 기타 API 에러도 유효하지 않은 것으로 간주

		} catch (Exception e) {
			log.error("카카오 토큰 검사 중 예상치 못한 오류 발생: {}", e.getMessage());
			return false;
		}

	}
}
