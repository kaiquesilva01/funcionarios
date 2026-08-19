package br.com.itau.funcionarios.employee.adapter.input.web.dto;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeResponse(
		UUID id,
		String name,
		String email,
		String role,
		BigDecimal salary,
		LocalDate hireDate) {

	public static EmployeeResponse from(Employee employee) {
		return new EmployeeResponse(
				employee.id(),
				employee.name(),
				employee.email(),
				employee.role(),
				employee.salary(),
				employee.hireDate());
	}
}
