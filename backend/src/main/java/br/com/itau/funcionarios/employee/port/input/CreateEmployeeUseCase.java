package br.com.itau.funcionarios.employee.port.input;

import br.com.itau.funcionarios.employee.domain.model.Employee;

public interface CreateEmployeeUseCase {

	Employee create(Employee employee);
}
