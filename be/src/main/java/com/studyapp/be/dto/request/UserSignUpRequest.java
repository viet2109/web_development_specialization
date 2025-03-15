package com.studyapp.be.dto.request;

import com.studyapp.be.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserSignUpRequest {
    private String firstName;
    private String lastName;

    @NotNull(message = "Gender must not be null")
    private Gender gender;

    @Pattern(regexp = "/(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\\b/", message = "Invalid phone number format")
    private String phone;
    private LocalDate birthDate;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be greater than 6")
    private String password;
}
