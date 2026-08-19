package br.com.itau.funcionarios.employee.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record Employee(
		UUID id,
		String name,
		String email,
		String role,
		BigDecimal salary,
		LocalDate hireDate) {

	public Employee withId(UUID newId) {
		return new Employee(newId, name, email, role, salary, hireDate);
	}
}
