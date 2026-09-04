package br.com.itau.funcionarios.employee.adapter.input.web;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.itau.funcionarios.employee.domain.exception.EmployeeEmailAlreadyExistsException;
import br.com.itau.funcionarios.employee.domain.exception.EmployeeNotFoundException;
import br.com.itau.funcionarios.employee.domain.model.Employee;
import br.com.itau.funcionarios.employee.port.input.CreateEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.DeleteEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.GetEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.ListEmployeesUseCase;
import br.com.itau.funcionarios.employee.port.input.UpdateEmployeeUseCase;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EmployeeController.class)
class EmployeeControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private CreateEmployeeUseCase createEmployeeUseCase;

	@MockitoBean
	private UpdateEmployeeUseCase updateEmployeeUseCase;

	@MockitoBean
	private DeleteEmployeeUseCase deleteEmployeeUseCase;

	@MockitoBean
	private GetEmployeeUseCase getEmployeeUseCase;

	@MockitoBean
	private ListEmployeesUseCase listEmployeesUseCase;

	private Employee sampleEmployee(UUID id) {
		return new Employee(id, "Maria Silva", "maria.silva@itau.com.br", "Analista", new BigDecimal("5000.00"),
				LocalDate.of(2024, 1, 15));
	}

	@Test
	void listsEmployees() throws Exception {
		when(listEmployeesUseCase.list(eq(null), eq(null), any()))
				.thenReturn(new PageImpl<>(List.of(sampleEmployee(UUID.randomUUID()))));

		mockMvc.perform(get("/api/employees"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)));
	}

	@Test
	void listsEmployeesFilteredByRole() throws Exception {
		when(listEmployeesUseCase.list(eq("dev"), eq(null), any()))
				.thenReturn(new PageImpl<>(List.of(sampleEmployee(UUID.randomUUID()))));

		mockMvc.perform(get("/api/employees").param("role", "dev"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)));
	}

	@Test
	void listsEmployeesFilteredBySearch() throws Exception {
		when(listEmployeesUseCase.list(eq(null), eq("maria"), any()))
				.thenReturn(new PageImpl<>(List.of(sampleEmployee(UUID.randomUUID()))));

		mockMvc.perform(get("/api/employees").param("search", "maria"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(1)));
	}

	@Test
	void listsAllEmployeesWhenRoleParamIsEmpty() throws Exception {
		when(listEmployeesUseCase.list(eq(""), eq(null), any())).thenReturn(new PageImpl<>(
				List.of(sampleEmployee(UUID.randomUUID()), sampleEmployee(UUID.randomUUID()))));

		mockMvc.perform(get("/api/employees").param("role", ""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content", hasSize(2)));
	}

	@Test
	void appliesPageAndSizeParams() throws Exception {
		Page<Employee> page = new PageImpl<>(List.of(sampleEmployee(UUID.randomUUID())),
				PageRequest.of(1, 5, Sort.by("name").ascending()), 11);
		when(listEmployeesUseCase.list(eq(null), eq(null), any())).thenReturn(page);

		mockMvc.perform(get("/api/employees").param("page", "1").param("size", "5"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.page").value(1))
				.andExpect(jsonPath("$.size").value(5))
				.andExpect(jsonPath("$.totalElements").value(11))
				.andExpect(jsonPath("$.totalPages").value(3));
	}

	@Test
	void appliesSortParam() throws Exception {
		when(listEmployeesUseCase.list(eq(null), eq(null), any())).thenReturn(new PageImpl<>(List.of()));

		mockMvc.perform(get("/api/employees").param("sort", "salary,desc"))
				.andExpect(status().isOk());

		var pageableCaptor = org.mockito.ArgumentCaptor.forClass(Pageable.class);
		verify(listEmployeesUseCase).list(eq(null), eq(null), pageableCaptor.capture());
		Sort.Order order = pageableCaptor.getValue().getSort().getOrderFor("salary");
		org.assertj.core.api.Assertions.assertThat(order).isNotNull();
		org.assertj.core.api.Assertions.assertThat(order.getDirection()).isEqualTo(Sort.Direction.DESC);
	}

	@Test
	void rejectsInvalidSortProperty() throws Exception {
		mockMvc.perform(get("/api/employees").param("sort", "unknownField,asc"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void returnsEmployeeById() throws Exception {
		UUID id = UUID.randomUUID();
		when(getEmployeeUseCase.getById(id)).thenReturn(sampleEmployee(id));

		mockMvc.perform(get("/api/employees/{id}", id))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("Maria Silva"));
	}

	@Test
	void returnsNotFoundWhenEmployeeDoesNotExist() throws Exception {
		UUID id = UUID.randomUUID();
		when(getEmployeeUseCase.getById(id)).thenThrow(new EmployeeNotFoundException(id));

		mockMvc.perform(get("/api/employees/{id}", id))
				.andExpect(status().isNotFound());
	}

	@Test
	void createsEmployee() throws Exception {
		UUID id = UUID.randomUUID();
		when(createEmployeeUseCase.create(any())).thenReturn(sampleEmployee(id));

		String body = """
				{
				  "name": "Maria Silva",
				  "email": "maria.silva@itau.com.br",
				  "role": "Analista",
				  "salary": 5000.00,
				  "hireDate": "2024-01-15"
				}
				""";

		mockMvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(id.toString()));
	}

	@Test
	void rejectsCreationWithInvalidPayload() throws Exception {
		String body = """
				{
				  "name": "",
				  "email": "invalido",
				  "role": "",
				  "salary": -1,
				  "hireDate": "2999-01-01"
				}
				""";

		mockMvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isBadRequest());
	}

	@Test
	void rejectsCreationWithDuplicatedEmail() throws Exception {
		when(createEmployeeUseCase.create(any()))
				.thenThrow(new EmployeeEmailAlreadyExistsException("maria.silva@itau.com.br"));

		String body = """
				{
				  "name": "Maria Silva",
				  "email": "maria.silva@itau.com.br",
				  "role": "Analista",
				  "salary": 5000.00,
				  "hireDate": "2024-01-15"
				}
				""";

		mockMvc.perform(post("/api/employees").contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isConflict());
	}

	@Test
	void updatesEmployee() throws Exception {
		UUID id = UUID.randomUUID();
		when(updateEmployeeUseCase.update(eq(id), any())).thenReturn(sampleEmployee(id));

		String body = """
				{
				  "name": "Maria Silva Santos",
				  "email": "maria.silva@itau.com.br",
				  "role": "Sênior",
				  "salary": 7000.00,
				  "hireDate": "2024-01-15"
				}
				""";

		mockMvc.perform(put("/api/employees/{id}", id).contentType(MediaType.APPLICATION_JSON).content(body))
				.andExpect(status().isOk());
	}

	@Test
	void deletesEmployee() throws Exception {
		UUID id = UUID.randomUUID();
		doNothing().when(deleteEmployeeUseCase).delete(id);

		mockMvc.perform(delete("/api/employees/{id}", id))
				.andExpect(status().isNoContent());

		verify(deleteEmployeeUseCase).delete(id);
	}
}
