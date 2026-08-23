package br.com.itau.funcionarios.employee.adapter.output.jpa;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import br.com.itau.funcionarios.employee.port.output.EmployeeRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
class JpaEmployeeRepositoryAdapter implements EmployeeRepository {

	private final SpringDataEmployeeRepository springDataEmployeeRepository;

	JpaEmployeeRepositoryAdapter(SpringDataEmployeeRepository springDataEmployeeRepository) {
		this.springDataEmployeeRepository = springDataEmployeeRepository;
	}

	@Override
	public Employee save(Employee employee) {
		Employee toPersist = employee.id() == null ? employee.withId(UUID.randomUUID()) : employee;
		EmployeeEntity saved = springDataEmployeeRepository.save(EmployeeMapper.toEntity(toPersist));
		return EmployeeMapper.toDomain(saved);
	}

	@Override
	public Optional<Employee> findById(UUID id) {
		return springDataEmployeeRepository.findById(id).map(EmployeeMapper::toDomain);
	}

	@Override
	public Page<Employee> search(String roleFilter, String search, Pageable pageable) {
		return springDataEmployeeRepository.search(roleFilter, search, pageable).map(EmployeeMapper::toDomain);
	}

	@Override
	public boolean existsByEmailAndIdNot(String email, UUID id) {
		return springDataEmployeeRepository.existsByEmailAndIdNot(email, id);
	}

	@Override
	public boolean existsByEmail(String email) {
		return springDataEmployeeRepository.existsByEmail(email);
	}

	@Override
	public boolean existsById(UUID id) {
		return springDataEmployeeRepository.existsById(id);
	}

	@Override
	public void deleteById(UUID id) {
		springDataEmployeeRepository.deleteById(id);
	}
}
