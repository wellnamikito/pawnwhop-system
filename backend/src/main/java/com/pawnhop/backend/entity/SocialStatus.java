package com.pawnhop.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "social_status")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class SocialStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "social_status_id")
    private Integer socialStatusId;

    @Size(max = 100)
    @Column(name = "status_name", length = 100)
    private String statusName;
}
