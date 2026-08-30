package com.pawnhop.backend.auth.database;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${app.datasource.admin.username}")
    private String adminUsername;

    @Value("${app.datasource.admin.password}")
    private String adminPassword;

    @Value("${app.datasource.operator.username}")
    private String operatorUsername;

    @Value("${app.datasource.operator.password}")
    private String operatorPassword;

    @Value("${app.datasource.analyst.username}")
    private String analystUsername;

    @Value("${app.datasource.analyst.password}")
    private String analystPassword;


    @Bean
    public DataSource adminDataSource() {

        return createDataSource(
                adminUsername,
                adminPassword
        );
    }


    @Bean
    public DataSource operatorDataSource() {

        return createDataSource(
                operatorUsername,
                operatorPassword
        );
    }


    @Bean
    public DataSource analystDataSource() {

        return createDataSource(
                analystUsername,
                analystPassword
        );
    }


    @Bean
    @Primary
    public DataSource dataSource(
            @Qualifier("adminDataSource")
            DataSource adminDataSource,

            @Qualifier("operatorDataSource")
            DataSource operatorDataSource,

            @Qualifier("analystDataSource")
            DataSource analystDataSource
    ) {

        RoleRoutingDataSource routingDataSource =
                new RoleRoutingDataSource();

        Map<Object, Object> dataSources = new HashMap<>();

        dataSources.put(
                DatabaseRole.ADMIN,
                adminDataSource
        );

        dataSources.put(
                DatabaseRole.OPERATOR,
                operatorDataSource
        );

        dataSources.put(
                DatabaseRole.ANALYST,
                analystDataSource
        );

        routingDataSource.setTargetDataSources(dataSources);

        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }


    private DataSource createDataSource(
            String username,
            String password
    ) {

        HikariDataSource dataSource =
                DataSourceBuilder.create()
                        .type(HikariDataSource.class)
                        .url(url)
                        .username(username)
                        .password(password)
                        .build();

        dataSource.setMaximumPoolSize(10);
        dataSource.setMinimumIdle(2);

        return dataSource;
    }
}
