package br.com.itau.funcionarios.employee.port.output;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository {

	Employee save(Employee employee);

	Optional<Employee> findById(UUID id);

	List<Employee> findAll();

	List<Employee> findByRoleContainingIgnoreCase(String role);

	boolean existsByEmailAndIdNot(String email, UUID id);

	boolean existsByEmail(String email);

	boolean existsById(UUID id);

	void deleteById(UUID id);
}
