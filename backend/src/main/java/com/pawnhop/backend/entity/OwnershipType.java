package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;


@Entity
@Table(name = "ownership_type")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class OwnershipType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ownership_type_id")
    private Integer ownershipTypeId;

    @Size(max = 100)
    @Column(name = "type_name", length = 100)
    private String typeName;
}
