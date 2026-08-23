package br.com.itau.funcionarios.employee.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.itau.funcionarios.employee.domain.exception.EmployeeEmailAlreadyExistsException;
import br.com.itau.funcionarios.employee.domain.exception.EmployeeNotFoundException;
import br.com.itau.funcionarios.employee.domain.model.Employee;
import br.com.itau.funcionarios.employee.port.output.EmployeeRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

	@Mock
	private EmployeeRepository employeeRepository;

	private EmployeeService employeeService;

	@BeforeEach
	void setUp() {
		employeeService = new EmployeeService(employeeRepository);
	}

	private Employee sampleEmployee(UUID id) {
		return new Employee(id, "Maria Silva", "maria.silva@itau.com.br", "Analista", new BigDecimal("5000.00"),
				LocalDate.of(2024, 1, 15));
	}

	@Test
	void createsEmployeeWhenEmailIsNotTaken() {
		Employee toCreate = sampleEmployee(null);
		Employee saved = sampleEmployee(UUID.randomUUID());

		when(employeeRepository.existsByEmail(toCreate.email())).thenReturn(false);
		when(employeeRepository.save(any())).thenReturn(saved);

		Employee result = employeeService.create(toCreate);

		assertThat(result).isEqualTo(saved);
	}

	@Test
	void rejectsCreationWhenEmailAlreadyExists() {
		Employee toCreate = sampleEmployee(null);
		when(employeeRepository.existsByEmail(toCreate.email())).thenReturn(true);

		assertThatThrownBy(() -> employeeService.create(toCreate))
				.isInstanceOf(EmployeeEmailAlreadyExistsException.class);

		verify(employeeRepository, never()).save(any());
	}

	@Test
	void updatesExistingEmployee() {
		UUID id = UUID.randomUUID();
		Employee existing = sampleEmployee(id);
		Employee updated = new Employee(null, "Maria Silva Santos", existing.email(), "Sênior",
				new BigDecimal("7000.00"), existing.hireDate());

		when(employeeRepository.findById(id)).thenReturn(Optional.of(existing));
		when(employeeRepository.existsByEmailAndIdNot(updated.email(), id)).thenReturn(false);
		when(employeeRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

		Employee result = employeeService.update(id, updated);

		assertThat(result.id()).isEqualTo(id);
		assertThat(result.name()).isEqualTo("Maria Silva Santos");
	}

	@Test
	void rejectsUpdateWhenEmployeeDoesNotExist() {
		UUID id = UUID.randomUUID();
		when(employeeRepository.findById(id)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.update(id, sampleEmployee(id)))
				.isInstanceOf(EmployeeNotFoundException.class);
	}

	@Test
	void rejectsUpdateWhenEmailBelongsToAnotherEmployee() {
		UUID id = UUID.randomUUID();
		Employee existing = sampleEmployee(id);

		when(employeeRepository.findById(id)).thenReturn(Optional.of(existing));
		when(employeeRepository.existsByEmailAndIdNot(existing.email(), id)).thenReturn(true);

		assertThatThrownBy(() -> employeeService.update(id, existing))
				.isInstanceOf(EmployeeEmailAlreadyExistsException.class);
	}

	@Test
	void deletesExistingEmployee() {
		UUID id = UUID.randomUUID();
		when(employeeRepository.existsById(id)).thenReturn(true);

		employeeService.delete(id);

		verify(employeeRepository).deleteById(id);
	}

	@Test
	void rejectsDeletionWhenEmployeeDoesNotExist() {
		UUID id = UUID.randomUUID();
		when(employeeRepository.existsById(id)).thenReturn(false);

		assertThatThrownBy(() -> employeeService.delete(id))
				.isInstanceOf(EmployeeNotFoundException.class);

		verify(employeeRepository, never()).deleteById(any());
	}

	@Test
	void returnsEmployeeById() {
		UUID id = UUID.randomUUID();
		Employee existing = sampleEmployee(id);
		when(employeeRepository.findById(id)).thenReturn(Optional.of(existing));

		assertThat(employeeService.getById(id)).isEqualTo(existing);
	}

	@Test
	void throwsWhenEmployeeByIdDoesNotExist() {
		UUID id = UUID.randomUUID();
		when(employeeRepository.findById(id)).thenReturn(Optional.empty());

		assertThatThrownBy(() -> employeeService.getById(id))
				.isInstanceOf(EmployeeNotFoundException.class);
	}

	@Test
	void listsEmployeesDelegatingToRepositoryWithNormalizedFilters() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<Employee> page = new PageImpl<>(List.of(sampleEmployee(UUID.randomUUID())));
		when(employeeRepository.search("dev", "maria", pageable)).thenReturn(page);

		Page<Employee> result = employeeService.list("  dev  ", "  maria  ", pageable);

		assertThat(result).isEqualTo(page);
		verify(employeeRepository).search("dev", "maria", pageable);
	}

	@Test
	void normalizesNullFiltersToEmptyString() {
		Pageable pageable = PageRequest.of(0, 10);
		Page<Employee> page = new PageImpl<>(List.of());
		when(employeeRepository.search(eq(""), eq(""), any())).thenReturn(page);

		employeeService.list(null, null, pageable);

		verify(employeeRepository).search("", "", pageable);
	}
}
