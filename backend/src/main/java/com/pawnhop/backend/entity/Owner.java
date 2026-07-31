package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "owners")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Owner {

    private static final String FIO_Domain = "^[A-Za-zА-Яа-яЁё\\- ]+$";

    private static final String phone_Domain = "^\\+7[0-9]{10}$";

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id")
    private Integer ownerId;

    @NotNull
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "last_name", columnDefinition = "fio_domain")
    private String lastName;

    @NotNull
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "first_name", columnDefinition = "fio_domain")
    private String firstName;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Pattern(regexp = FIO_Domain, message = "ФИО может содержать только буквы, дефис и пробел")
    @Column(name = "middle_name", columnDefinition = "fio_domain")
    private String middleName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_type_id")
    private OwnerType ownerTypeId;

    @Size(max = 12)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Pattern(regexp = phone_Domain, message ="Телефон должен быть в формате +7XXXXXXXXXX" )
    @Column(name = "phone", columnDefinition = "phone_domain")
    private String phone;


}
