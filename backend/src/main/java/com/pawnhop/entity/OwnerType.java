package com.pawnhop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name ="owner_type")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class OwnerType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Owner_type_id")
    private Integer ownerTypeId;

    @Size(max = 100)
    @Column(name = "type_name", length = 100)
    private String typeName;
}
