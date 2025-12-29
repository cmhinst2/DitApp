package com.dit.app.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.dit.app.common.interceptor.AuthInterceptor;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
	
	private final AuthInterceptor authInterceptor;
	
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Preflight 요청 결과를 1시간 동안 캐싱
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
    	registry.addInterceptor(authInterceptor)
        .addPathPatterns("/api/**", "/ai/**") // 인터셉터를 적용할 경로 
        .excludePathPatterns(
            "/api/auth/kakao/login",  // 로그인 경로는 제외
            "/api/auth/kakao/logout", // 로그아웃도 제외
            "/api/public/**",         // 로그인 없이 볼 수 있는 페이지 제외
            "/favicon.ico",
            "/error"
        );
    }
}