package br.com.itau.funcionarios.employee.adapter.input.web.dto;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.math.BigDecimal;
import java.time.LocalDate;

public record EmployeeRequest(
		@NotBlank(message = "O nome é obrigatório") String name,
		@NotBlank(message = "O e-mail é obrigatório") @Email(message = "E-mail inválido") String email,
		@NotBlank(message = "O cargo é obrigatório") String role,
		@NotNull(message = "O salário é obrigatório") @DecimalMin(value = "0.0", inclusive = true, message = "O salário não pode ser negativo") BigDecimal salary,
		@NotNull(message = "A data de admissão é obrigatória") @PastOrPresent(message = "A data de admissão não pode estar no futuro") LocalDate hireDate) {

	public Employee toDomain() {
		return new Employee(null, name, email, role, salary, hireDate);
	}
}
