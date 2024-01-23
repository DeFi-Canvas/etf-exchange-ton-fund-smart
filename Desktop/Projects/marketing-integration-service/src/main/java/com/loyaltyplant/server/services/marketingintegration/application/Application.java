package com.loyaltyplant.server.services.marketingintegration.application;

import com.loyaltyplant.server.services.marketingintegration.application.spring.RootConfiguration;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackageClasses = RootConfiguration.class)
public class Application {
    public static void main(String[] args) throws Exception {
        LoggerFactory.getLogger(Application.class).info("Starting {}", Application.class);
        SpringApplication.run(Application.class, args);
    }
}
