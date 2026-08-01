package com.pawnhop.backend.auth.config;

import com.pawnhop.backend.auth.exception.CustomAccessDeniedHandler;
import com.pawnhop.backend.auth.exception.CustomAuthenticationEntryPoint;
import com.pawnhop.backend.auth.filter.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    private final CustomAccessDeniedHandler customAccessDeniedHandler;


    @Bean
    SecurityFilterChain filterChain(

            HttpSecurity http

    ) throws Exception {

        return http

                .csrf(csrf -> csrf.disable())

                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // авторизация
                        .requestMatchers("/api/auth/login")

                        .permitAll()

                        // админ
                        .requestMatchers(
                                "/api/admin/**"
                        )
                        .hasRole("ADMIN")

                                // =============================
                                // Основные таблицы - просмотр
                                // =============================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/pawnshops/**",
                                        "/api/owners/**",
                                        "/api/clients/**",
                                        "/api/loans/**",
                                        "/api/loans/*/items/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "OPERATOR",
                                        "ANALYST"
                                )


                                // =============================
                                // Основные таблицы - создание
                                // =============================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/pawnshops/**",
                                        "/api/owners/**",
                                        "/api/clients/**",
                                        "/api/loans/**",
                                        "/api/loans/*/items/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "OPERATOR"
                                )


                                // =============================
                                // Основные таблицы - изменение
                                // =============================

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/pawnshops/**",
                                        "/api/owners/**",
                                        "/api/clients/**",
                                        "/api/loans/**",
                                        "/api/loans/*/items/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "OPERATOR"
                                )


                                // =============================
                                // Основные таблицы - удаление
                                // =============================

                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/pawnshops/**",
                                        "/api/owners/**",
                                        "/api/clients/**",
                                        "/api/loans/**",
                                        "/api/loans/*/items/**"
                                )
                                .hasRole("ADMIN")


                                // справочники - просмотр

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/districts/**",
                                        "/api/owner-types/**",
                                        "/api/ownership-types/**",
                                        "/api/social-statuses/**",
                                        "/api/pledge-item-types/**"
                                )
                                .hasAnyRole(
                                        "ADMIN",
                                        "OPERATOR",
                                        "ANALYST"
                                )


                                // справочники - изменение

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/districts/**",
                                        "/api/owner-types/**",
                                        "/api/ownership-types/**",
                                        "/api/social-statuses/**",
                                        "/api/pledge-item-types/**"
                                )
                                .hasRole("ADMIN")


                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/districts/**",
                                        "/api/owner-types/**",
                                        "/api/ownership-types/**",
                                        "/api/social-statuses/**",
                                        "/api/pledge-item-types/**"
                                )
                                .hasRole("ADMIN")


                                .requestMatchers(
                                        HttpMethod.DELETE,
                                        "/api/districts/**",
                                        "/api/owner-types/**",
                                        "/api/ownership-types/**",
                                        "/api/social-statuses/**",
                                        "/api/pledge-item-types/**"
                                )
                                .hasRole("ADMIN")

                        // отчёт и экспорт
                        .requestMatchers(
                                "/api/report/**",
                                "/api/export/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALYST"
                        )

                        // всё остальное
                        .anyRequest()
                        .authenticated()

                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                .build();

    }

}
