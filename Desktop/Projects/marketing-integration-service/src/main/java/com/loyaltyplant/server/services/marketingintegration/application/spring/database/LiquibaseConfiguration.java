package com.loyaltyplant.server.services.marketingintegration.application.spring.database;

import com.loyaltyplant.server.commons.db.migration.LiquibaseDefaults;
import com.loyaltyplant.server.commons.db.migration.SingleDatasourceMigrationConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import java.util.Collections;
import java.util.Map;

@Configuration
@Import({
        SingleDatasourceMigrationConfiguration.class,
})
public class LiquibaseConfiguration {
    @Bean
    public SingleDatasourceMigrationConfiguration.LiquibaseBuilderAdjuster liquibaseBuilderAdjuster() {
        return builder -> builder.changelogsPath(LiquibaseDefaults.getChangelogsPath("microservice"));
    }

    @Bean(name = "liquibase.changelogParams")
    public Map<String, String> liquibaseChangelogParams() {
        return Collections.emptyMap();
    }
}
