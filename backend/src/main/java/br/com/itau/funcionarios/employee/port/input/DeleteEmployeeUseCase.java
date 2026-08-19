package br.com.itau.funcionarios.employee.port.input;

import java.util.UUID;

public interface DeleteEmployeeUseCase {

	void delete(UUID id);
}
