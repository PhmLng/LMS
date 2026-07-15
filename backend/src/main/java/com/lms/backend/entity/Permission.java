package com.lms.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Permission {

    @Id
    private String permission;
    private String description;
}
