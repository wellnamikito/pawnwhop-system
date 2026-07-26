package com.pawnhop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "district")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class District {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column (name = "district_id")
    private Integer districtId;

    @Size(max = 100)
    @Column(name = "district_name", length = 100)
    private String districtName;
}
