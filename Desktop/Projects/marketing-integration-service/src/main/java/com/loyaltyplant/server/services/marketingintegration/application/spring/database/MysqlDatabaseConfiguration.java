package com.loyaltyplant.server.services.marketingintegration.application.spring.database;

import com.loyaltyplant.oss.plantsql.SQLTemplateFactory;
import com.loyaltyplant.oss.plantsql.SQLTemplateFactoryBuilder;
import com.loyaltyplant.server.commons.db.datasource.config.DataSourceConfigurationSupport;
import com.loyaltyplant.server.commons.db.datasource.config.DataSourceProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.util.Collections;

@Configuration
class MysqlDatabaseConfiguration extends DataSourceConfigurationSupport {
    private static final String DATASOURCE_SETTINGS_BEAN = "datasourceSettings";
    private static final String DATASOURCE_PROPERTIES_PREFIX = "db.";
    private static final String DATASOURCE_NAME = "dataSource";

    private final DataSourceProperties dataSourceProperties;

    @SuppressWarnings("SpringJavaAutowiringInspection")
    public MysqlDatabaseConfiguration(@Qualifier(DATASOURCE_SETTINGS_BEAN) final DataSourceProperties dataSourceProperties) {
        this.dataSourceProperties = dataSourceProperties;
    }

    @Bean("msql")
    public SQLTemplateFactory sqlTemplateFactory(@Qualifier("dataSource") DataSource dataSource) {
        return SQLTemplateFactoryBuilder.forDatasource(dataSource).build();
    }

    @Bean
    public static BeanDefinitionRegistryPostProcessor singleDataSourceConfigurer() {
        return createDataSourceSettingsBeans(
                Collections.singletonMap(DATASOURCE_SETTINGS_BEAN, DATASOURCE_PROPERTIES_PREFIX));
    }

    @Bean(name = {DATASOURCE_NAME})
    public DataSource dataSource() {
        return createPooledDataSource(DATASOURCE_NAME, dataSourceProperties);
    }
}