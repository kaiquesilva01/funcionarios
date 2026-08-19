package br.com.itau.funcionarios.employee.domain.exception;

import java.util.UUID;

public class EmployeeNotFoundException extends RuntimeException {

	public EmployeeNotFoundException(UUID id) {
		super("Funcionário não encontrado: " + id);
	}
}
