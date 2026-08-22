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
	void listsAllEmployees() {
		repositoryAdapter.save(sampleEmployee(null));
		repositoryAdapter.save(new Employee(null, "João Souza", "joao.souza@itau.com.br", "Gerente",
				new BigDecimal("9000.00"), LocalDate.of(2023, 5, 10)));

		assertThat(repositoryAdapter.findAll()).hasSize(2);
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

		assertThat(repositoryAdapter.findByRoleContainingIgnoreCase("dev")).hasSize(2)
				.extracting(Employee::role)
				.containsExactlyInAnyOrder("Dev Backend", "DEV Senior");
	}
}
