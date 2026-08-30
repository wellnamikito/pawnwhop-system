package com.pawnhop.backend.auth.filter;

import com.pawnhop.backend.auth.database.DatabaseRole;
import com.pawnhop.backend.auth.database.DatabaseRoutingContext;
import com.pawnhop.backend.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String header =
                    request.getHeader("Authorization");

            if (header == null ||
                    !header.startsWith("Bearer ")) {

                filterChain.doFilter(request, response);
                return;
            }

            String token = header.substring(7);

            if (!jwtService.isTokenValid(token)) {

                filterChain.doFilter(request, response);
                return;
            }

            String username =
                    jwtService.extractUsername(token);

            String role =
                    jwtService.extractRole(token);

            if (role == null || role.isBlank()) {

                filterChain.doFilter(request, response);
                return;
            }

            String normalizedRole =
                    role.replace("_role", "")
                            .toUpperCase();

            DatabaseRole databaseRole;

            try {

                databaseRole =
                        DatabaseRole.valueOf(normalizedRole);

            } catch (IllegalArgumentException e) {

                filterChain.doFilter(request, response);
                return;
            }

            String authority =
                    "ROLE_" + normalizedRole;

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                username,
                                null,
                                List.of(
                                        new SimpleGrantedAuthority(
                                                authority
                                        )
                                )
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

            /*
             * Устанавливаем PostgreSQL role
             * для текущего HTTP-запроса.
             *
             * Например:
             *
             * ROLE_ADMIN
             *      ↓
             * DatabaseRole.ADMIN
             *      ↓
             * pawnwhop_admin
             */
            DatabaseRoutingContext.setRole(databaseRole);

            filterChain.doFilter(request, response);

        } finally {

            /*
             * Обязательно очищаем ThreadLocal.
             *
             * Spring/Tomcat использует пул потоков,
             * поэтому следующий HTTP-запрос может
             * получить тот же поток.
             */
            DatabaseRoutingContext.clear();

            SecurityContextHolder.clearContext();
        }
    }
}
