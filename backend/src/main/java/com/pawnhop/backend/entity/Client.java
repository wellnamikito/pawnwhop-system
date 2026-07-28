package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "client")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Client {

    private static final String FIO_Domain = "^[A-Za-zА-Яа-яЁё\\- ]+$";

    private static final String phone_Domain = "^\\+7[0-9]{10}$";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "client_id")
    private Integer clientId;

    @NotNull
    @Size(max = 100)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotNull
    @Size(max = 100)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Size(max = 100)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "middle_name", nullable = false, length = 100)
    private String middleName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "social_status_id")
    private socialStatus socialStatusId;

    @NotNull
    @Size(max = 100)
    @Column(name = "address", nullable = false, length = 100)
    private String address;

    @Size(max = 12)
    @Pattern(regexp = phone_Domain, message ="Телефон должен быть в формате +7XXXXXXXXXX" )
    @Column(name = "phone", length = 12)
    private String phone;
}
