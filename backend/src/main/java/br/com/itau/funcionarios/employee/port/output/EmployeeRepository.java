package br.com.itau.funcionarios.employee.port.output;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EmployeeRepository {

	Employee save(Employee employee);

	Optional<Employee> findById(UUID id);

	Page<Employee> search(String roleFilter, String search, Pageable pageable);

	boolean existsByEmailAndIdNot(String email, UUID id);

	boolean existsByEmail(String email);

	boolean existsById(UUID id);

	void deleteById(UUID id);
}
