package br.com.itau.funcionarios.employee.port.input;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.util.UUID;

public interface GetEmployeeUseCase {

	Employee getById(UUID id);
}
