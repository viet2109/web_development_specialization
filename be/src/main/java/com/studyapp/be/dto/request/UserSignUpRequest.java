package com.studyapp.be.dto.request;

import com.studyapp.be.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.Period;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UserSignUpRequest {
    @NotBlank(message = "First name must not be blank")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name must not be blank")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @NotNull(message = "Gender must not be null")
    private Gender gender;

    @Pattern(
            regexp = "(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\\b",
            message = "Invalid phone number format"
    )
    private String phone;


    @Past(message = "Birth date must be in the past")
    private LocalDate birthDate;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be greater than 6 characters")
    private String password;

    @AssertTrue(
            message = "You must be at least 13 years old"
    )
    private boolean isBirthDateValid() {
        if (birthDate == null) {
            return true;
        }
        LocalDate today = LocalDate.now();
        if (birthDate.isAfter(today)) {
            return false;
        }
        int age = Period.between(birthDate, today).getYears();
        return age >= 13;
    }
}
