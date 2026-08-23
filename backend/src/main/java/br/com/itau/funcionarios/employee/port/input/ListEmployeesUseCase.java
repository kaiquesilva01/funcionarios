package br.com.itau.funcionarios.employee.port.input;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ListEmployeesUseCase {

	Page<Employee> list(String roleFilter, String search, Pageable pageable);
}
