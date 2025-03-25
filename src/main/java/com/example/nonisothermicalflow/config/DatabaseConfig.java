package com.example.nonisothermicalflow.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.HashMap;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.example.nonisothermicalflow.materials.repository",
    entityManagerFactoryRef = "materialsEntityManagerFactory",
    transactionManagerRef = "materialsTransactionManager"
)
public class DatabaseConfig {

    @Primary
    @Bean(name = "materialsDataSource")
    public DataSource materialsDataSource() {
        return DataSourceBuilder.create()
                .url("jdbc:postgresql://localhost:5432/materials_db")
                .username("postgres")
                .password("Akrawer1")
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Primary
    @Bean(name = "materialsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean materialsEntityManagerFactory(
            @Qualifier("materialsDataSource") DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(dataSource);
        em.setPackagesToScan("com.example.nonisothermicalflow.materials.model");

        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);

        HashMap<String, Object> properties = new HashMap<>();
        properties.put("hibernate.hbm2ddl.auto", "update");
        properties.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        em.setJpaPropertyMap(properties);

        return em;
    }

    @Primary
    @Bean(name = "materialsTransactionManager")
    public PlatformTransactionManager materialsTransactionManager(
            @Qualifier("materialsEntityManagerFactory") LocalContainerEntityManagerFactoryBean entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory.getObject());
    }
} 