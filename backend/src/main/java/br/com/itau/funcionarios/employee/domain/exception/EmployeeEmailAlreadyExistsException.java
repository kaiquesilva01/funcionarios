package br.com.itau.funcionarios.employee.domain.exception;

public class EmployeeEmailAlreadyExistsException extends RuntimeException {

	public EmployeeEmailAlreadyExistsException(String email) {
		super("Já existe um funcionário cadastrado com o e-mail: " + email);
	}
}
