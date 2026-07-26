package com.pawnhop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "pawnshop")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class Pawnshop {

    private static final String phone_Domain = "^\\+7[0-9]{10}$";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pawnshop_id")
    private Integer pawnshopId;

    @NotNull
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownership_type_id")
    private OwnershipType ownershipTypeId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerid")
    private Owner ownerId;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District districtId;

    @NotNull
    @Size(max = 100)
    @Column(name = "address", nullable = false, length = 100)
    private String address;

    @Size(max = 12)
    @Pattern(regexp = phone_Domain, message ="Телефон должен быть в формате +7XXXXXXXXXX" )
    @Column(name = "phone", length = 12)
    private String phone;

    @Min(0)
    @Max(23)
    @Column(name = "opening_hour")
    private Integer openingHour;

    @Min(0)
    @Max(23)
    @Column(name = "closing_hour")
    private Integer closingHour;

    /**
     * Аналог CHECK (closing_hour > opening_hour) из БД.
     * Bean Validation не умеет сравнивать два поля декларативно,
     * поэтому используется @AssertTrue на вычисляемом методе.
     */
    @AssertTrue(message = "Час закрытия должен быть больше часа открытия")
    @Transient
    public boolean isClosingAfterOpening() {
        if (openingHour == null || closingHour == null) {
            return true;
        }
        return closingHour > openingHour;
    }
}
