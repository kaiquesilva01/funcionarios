package br.com.itau.funcionarios.employee.port.input;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.util.List;

public interface ListEmployeesUseCase {

	List<Employee> list(String roleFilter);
}
