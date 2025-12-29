package com.dit.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude={SecurityAutoConfiguration.class})
public class DitAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(DitAppApplication.class, args);
	}

}
