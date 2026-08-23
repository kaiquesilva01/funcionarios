package br.com.itau.funcionarios.employee.application;

import br.com.itau.funcionarios.employee.domain.exception.EmployeeEmailAlreadyExistsException;
import br.com.itau.funcionarios.employee.domain.exception.EmployeeNotFoundException;
import br.com.itau.funcionarios.employee.domain.model.Employee;
import br.com.itau.funcionarios.employee.port.input.CreateEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.DeleteEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.GetEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.ListEmployeesUseCase;
import br.com.itau.funcionarios.employee.port.input.UpdateEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.output.EmployeeRepository;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService implements
		CreateEmployeeUseCase,
		UpdateEmployeeUseCase,
		DeleteEmployeeUseCase,
		GetEmployeeUseCase,
		ListEmployeesUseCase {

	private final EmployeeRepository employeeRepository;

	public EmployeeService(EmployeeRepository employeeRepository) {
		this.employeeRepository = employeeRepository;
	}

	@Override
	public Employee create(Employee employee) {
		if (employeeRepository.existsByEmail(employee.email())) {
			throw new EmployeeEmailAlreadyExistsException(employee.email());
		}
		return employeeRepository.save(employee.withId(null));
	}

	@Override
	public Employee update(UUID id, Employee employee) {
		Employee existing = getById(id);
		if (employeeRepository.existsByEmailAndIdNot(employee.email(), id)) {
			throw new EmployeeEmailAlreadyExistsException(employee.email());
		}
		return employeeRepository.save(employee.withId(existing.id()));
	}

	@Override
	public void delete(UUID id) {
		if (!employeeRepository.existsById(id)) {
			throw new EmployeeNotFoundException(id);
		}
		employeeRepository.deleteById(id);
	}

	@Override
	public Employee getById(UUID id) {
		return employeeRepository.findById(id)
				.orElseThrow(() -> new EmployeeNotFoundException(id));
	}

	@Override
	public Page<Employee> list(String roleFilter, String search, Pageable pageable) {
		String trimmedRole = roleFilter == null ? "" : roleFilter.trim();
		String trimmedSearch = search == null ? "" : search.trim();
		return employeeRepository.search(trimmedRole, trimmedSearch, pageable);
	}
}
