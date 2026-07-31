package com.pawnhop.backend.auth.service;

import org.springframework.stereotype.Service;

import java.sql.*;

@Service
public class PostgreSQLAuthService {

    private final String url =
            "jdbc:postgresql://localhost:5433/pawnwhop";


    public String authenticate(
            String username,
            String password
    ){

        try(Connection connection =
                    DriverManager.getConnection(
                            url,
                            username,
                            password
                    )
        ){

            PreparedStatement statement =
                    connection.prepareStatement(
                            """
                            SELECT rolname
                            FROM pg_roles
                            WHERE pg_has_role(
                                current_user,
                                rolname,
                                'member'
                            )
                            AND rolname IN (
                                'admin_role',
                                'operator_role',
                                'analyst_role'
                            )
                            """
                    );


            ResultSet result =
                    statement.executeQuery();


            if(result.next()){

                return result.getString("rolname");

            }


            throw new RuntimeException(
                    "User has no role"
            );


        } catch (SQLException e){

            throw new RuntimeException(
                    "Invalid credentials"
            );
        }
    }
}