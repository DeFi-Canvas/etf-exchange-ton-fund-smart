package com.loyaltyplant.server.services.marketingintegration.application.spring.database;

import com.loyaltyplant.oss.plantsql.SQLTemplateFactory;
import com.loyaltyplant.oss.plantsql.SQLTemplateFactoryBuilder;
import com.loyaltyplant.server.commons.db.datasource.config.DataSourceConfigurationSupport;
import com.loyaltyplant.server.commons.db.datasource.config.DataSourceProperties;
import com.loyaltyplant.server.commons.properties.PropertiesLocationPatterns;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.Collections;
import java.util.Optional;

@Configuration
class PostgresDatabaseConfiguration extends DataSourceConfigurationSupport {
    private static final String BEAN_DS_SETTINGS_PG = "pgSettings";
    private static final String DS_PROPERTIES_PREFIX = "db.psql.";
    private static final String DS_NAME = "pg";

    @Bean("psql")
    public SQLTemplateFactory psqlTemplateFactory(@Qualifier("pgDatasource") final DataSource dataSource) {
        return SQLTemplateFactoryBuilder.forDatasource(dataSource).build();
    }

    @Bean(name = {"pgDatasource", "liquibase.dataSource"})
    public DataSource paymentDatasource(@Qualifier(BEAN_DS_SETTINGS_PG) final DataSourceProperties dsProps) {
        return createPooledDataSource(DS_NAME, dsProps);
    }

    @Bean(name = "pgPersistence.transactionManager")
    @SuppressWarnings("OptionalUsedAsFieldOrParameterType")
    public PlatformTransactionManager paymentPersistenceTransactionManager(@Qualifier("pgDatasource") final Optional<DataSource> dataSource) {
        return dataSource.map(DataSourceTransactionManager::new).orElse(null);
    }

    @Bean
    public BeanDefinitionRegistryPostProcessor createDataSourceConfigurer() {
        return DataSourceConfigurationSupport.createDataSourceSettingsBeans(Collections.singletonMap(BEAN_DS_SETTINGS_PG, DS_PROPERTIES_PREFIX));
    }

    @Bean
    public PropertiesLocationPatterns extraPropertiesLocationPatternsForDb() {
        return PropertiesLocationPatterns.inDefaultLayout("database.properties");
    }
}