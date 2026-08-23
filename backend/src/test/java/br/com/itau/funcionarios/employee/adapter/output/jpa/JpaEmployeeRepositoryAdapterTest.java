package br.com.itau.funcionarios.employee.adapter.output.jpa;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.itau.funcionarios.employee.domain.model.Employee;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@DataJpaTest
@Import(JpaEmployeeRepositoryAdapter.class)
class JpaEmployeeRepositoryAdapterTest {

	@Autowired
	private JpaEmployeeRepositoryAdapter repositoryAdapter;

	private Employee sampleEmployee(UUID id) {
		return new Employee(id, "Maria Silva", "maria.silva@itau.com.br", "Analista", new BigDecimal("5000.00"),
				LocalDate.of(2024, 1, 15));
	}

	@Test
	void savesAndFindsEmployeeById() {
		Employee saved = repositoryAdapter.save(sampleEmployee(null));

		assertThat(saved.id()).isNotNull();
		assertThat(repositoryAdapter.findById(saved.id())).contains(saved);
	}

	@Test
	void listsAllEmployeesWhenNoFilterIsApplied() {
		repositoryAdapter.save(sampleEmployee(null));
		repositoryAdapter.save(new Employee(null, "João Souza", "joao.souza@itau.com.br", "Gerente",
				new BigDecimal("9000.00"), LocalDate.of(2023, 5, 10)));

		Page<Employee> result = repositoryAdapter.search("", "", PageRequest.of(0, 10));

		assertThat(result.getTotalElements()).isEqualTo(2);
	}

	@Test
	void detectsExistingEmail() {
		Employee saved = repositoryAdapter.save(sampleEmployee(null));

		assertThat(repositoryAdapter.existsByEmail(saved.email())).isTrue();
		assertThat(repositoryAdapter.existsByEmailAndIdNot(saved.email(), saved.id())).isFalse();
		assertThat(repositoryAdapter.existsByEmailAndIdNot(saved.email(), UUID.randomUUID())).isTrue();
	}

	@Test
	void deletesEmployeeById() {
		Employee saved = repositoryAdapter.save(sampleEmployee(null));

		repositoryAdapter.deleteById(saved.id());

		assertThat(repositoryAdapter.existsById(saved.id())).isFalse();
	}

	@Test
	void findsEmployeesByRoleContainingIgnoreCase() {
		repositoryAdapter.save(new Employee(null, "Maria Silva", "maria.silva@itau.com.br", "Dev Backend",
				new BigDecimal("5000.00"), LocalDate.of(2024, 1, 15)));
		repositoryAdapter.save(new Employee(null, "João Souza", "joao.souza@itau.com.br", "DEV Senior",
				new BigDecimal("9000.00"), LocalDate.of(2023, 5, 10)));
		repositoryAdapter.save(new Employee(null, "Ana Costa", "ana.costa@itau.com.br", "Analista",
				new BigDecimal("6000.00"), LocalDate.of(2022, 3, 1)));

		Page<Employee> result = repositoryAdapter.search("dev", "", PageRequest.of(0, 10));

		assertThat(result.getContent()).hasSize(2)
				.extracting(Employee::role)
				.containsExactlyInAnyOrder("Dev Backend", "DEV Senior");
	}

	@Test
	void findsEmployeesByNameOrEmailSearch() {
		repositoryAdapter.save(new Employee(null, "Maria Silva", "maria.silva@itau.com.br", "Dev Backend",
				new BigDecimal("5000.00"), LocalDate.of(2024, 1, 15)));
		repositoryAdapter.save(new Employee(null, "João Souza", "joao.souza@itau.com.br", "Gerente",
				new BigDecimal("9000.00"), LocalDate.of(2023, 5, 10)));

		Page<Employee> byName = repositoryAdapter.search("", "maria", PageRequest.of(0, 10));
		Page<Employee> byEmail = repositoryAdapter.search("", "joao.souza", PageRequest.of(0, 10));

		assertThat(byName.getContent()).extracting(Employee::name).containsExactly("Maria Silva");
		assertThat(byEmail.getContent()).extracting(Employee::name).containsExactly("João Souza");
	}

	@Test
	void combinesRoleAndSearchFilters() {
		repositoryAdapter.save(new Employee(null, "Maria Silva", "maria.silva@itau.com.br", "Dev Backend",
				new BigDecimal("5000.00"), LocalDate.of(2024, 1, 15)));
		repositoryAdapter.save(new Employee(null, "Maria Souza", "maria.souza@itau.com.br", "Analista",
				new BigDecimal("6000.00"), LocalDate.of(2022, 3, 1)));

		Page<Employee> result = repositoryAdapter.search("dev", "maria", PageRequest.of(0, 10));

		assertThat(result.getContent()).extracting(Employee::name).containsExactly("Maria Silva");
	}

	@Test
	void paginatesAndSortsResults() {
		repositoryAdapter.save(new Employee(null, "Carlos Lima", "carlos.lima@itau.com.br", "Analista",
				new BigDecimal("4000.00"), LocalDate.of(2021, 1, 1)));
		repositoryAdapter.save(new Employee(null, "Ana Costa", "ana.costa@itau.com.br", "Analista",
				new BigDecimal("6000.00"), LocalDate.of(2022, 3, 1)));
		repositoryAdapter.save(new Employee(null, "Bruno Reis", "bruno.reis@itau.com.br", "Analista",
				new BigDecimal("5000.00"), LocalDate.of(2023, 6, 1)));

		Page<Employee> firstPage = repositoryAdapter.search("", "", PageRequest.of(0, 2, Sort.by("name").ascending()));
		Page<Employee> secondPage = repositoryAdapter.search("", "", PageRequest.of(1, 2, Sort.by("name").ascending()));

		assertThat(firstPage.getContent()).extracting(Employee::name).containsExactly("Ana Costa", "Bruno Reis");
		assertThat(secondPage.getContent()).extracting(Employee::name).containsExactly("Carlos Lima");
		assertThat(firstPage.getTotalPages()).isEqualTo(2);
	}
}
