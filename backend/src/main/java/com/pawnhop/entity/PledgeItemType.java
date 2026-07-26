package com.pawnhop.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "pledge_item_type")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class PledgeItemType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_type_id")
    private Integer itemTypeId;

    @Size(max = 100)
    @Column(name = "type_name",length = 100)
    private String typeName;
}
