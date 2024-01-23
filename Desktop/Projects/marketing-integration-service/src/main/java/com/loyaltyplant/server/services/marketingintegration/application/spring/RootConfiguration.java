package com.loyaltyplant.server.services.marketingintegration.application.spring;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loyaltyplant.server.commons.properties.DefaultSpringPropertiesConfiguration;
import com.loyaltyplant.server.commons.logging.spring.LoggingConfiguration;
import com.loyaltyplant.server.services.marketingintegration.application.controller.CommonController;
import com.loyaltyplant.server.services.marketingintegration.application.swagger.DoSwaggerConfig;
import com.loyaltyplant.server.services.marketingintegration.VersionInfo;
import com.loyaltyplant.server.services.marketingintegration.application.spring.database.DatabaseConfiguration;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
@ComponentScan(basePackages = {
        "com.loyaltyplant.server.services.marketingintegration"
})
@Import({
        DatabaseConfiguration.class,
        LoggingConfiguration.class,
        DefaultSpringPropertiesConfiguration.class,
        ConsulConfiguration.class,
        DoSwaggerConfig.class
})
public class RootConfiguration {

    @Bean
    public com.loyaltyplant.server.commons.utils.version.VersionInfo versionInfo() {
        return VersionInfo.INSTANCE;
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurerAdapter() {
            @Override
            public void addCorsMappings(final CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("https://confluence.loyaltyplant.com");
            }
        };
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
