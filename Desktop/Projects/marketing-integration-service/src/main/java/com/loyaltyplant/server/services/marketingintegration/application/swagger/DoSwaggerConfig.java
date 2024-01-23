package com.loyaltyplant.server.services.marketingintegration.application.swagger;

import com.loyaltyplant.server.services.marketingintegration.VersionInfo;
import io.swagger.annotations.Api;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMethod;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.service.ResponseMessage;
import springfox.documentation.service.Tag;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;
import static springfox.documentation.builders.PathSelectors.any;

@Configuration
@EnableSwagger2
public class DoSwaggerConfig {

    @Bean
    public Docket swaggerDocket() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.withClassAnnotation(Api.class))
                .paths(any())
                .build()
                .apiInfo(apiInfo())
                .globalResponseMessage(RequestMethod.GET, createResponseMessages(OK))
                .globalResponseMessage(RequestMethod.PUT, createResponseMessages(OK, UNAUTHORIZED, FORBIDDEN));

    }

    private ApiInfo apiInfo() {
        return new ApiInfo(
                "marketing-integration-service",
                "This is a description of your API.",
                VersionInfo.Build.VERSION,
                "FIXME_TOS_URL",
                new Contact("LP", "https://git.loyaltyplant.com/server/marketing-integration-service", null),
                "API License",
                "FIXME_API_LICENSE_URL",
                Collections.emptyList()
        );
    }

    private ResponseMessage createResponseMessage(final HttpStatus status) {
        return new ResponseMessage(
                status.value(),
                status.getReasonPhrase(),
                null,
                Collections.emptyMap(),
                Collections.emptyList()
        );
    }

    private List<ResponseMessage> createResponseMessages(final HttpStatus... statuses) {
        return Arrays.stream(statuses).map(this::createResponseMessage).collect(Collectors.toList());
    }

}