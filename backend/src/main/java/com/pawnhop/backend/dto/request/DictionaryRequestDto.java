package com.pawnhop.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DictionaryRequestDto {

    @NotBlank
    @Size(max = 100)
    private String name;
}
