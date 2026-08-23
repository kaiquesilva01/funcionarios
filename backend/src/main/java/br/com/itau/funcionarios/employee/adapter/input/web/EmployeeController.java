package br.com.itau.funcionarios.employee.adapter.input.web;

import br.com.itau.funcionarios.employee.adapter.input.web.dto.EmployeeRequest;
import br.com.itau.funcionarios.employee.adapter.input.web.dto.EmployeeResponse;
import br.com.itau.funcionarios.employee.adapter.input.web.dto.PagedResponse;
import br.com.itau.funcionarios.employee.port.input.CreateEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.DeleteEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.GetEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.ListEmployeesUseCase;
import br.com.itau.funcionarios.employee.port.input.UpdateEmployeeUseCase;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

	private final CreateEmployeeUseCase createEmployeeUseCase;
	private final UpdateEmployeeUseCase updateEmployeeUseCase;
	private final DeleteEmployeeUseCase deleteEmployeeUseCase;
	private final GetEmployeeUseCase getEmployeeUseCase;
	private final ListEmployeesUseCase listEmployeesUseCase;

	public EmployeeController(
			CreateEmployeeUseCase createEmployeeUseCase,
			UpdateEmployeeUseCase updateEmployeeUseCase,
			DeleteEmployeeUseCase deleteEmployeeUseCase,
			GetEmployeeUseCase getEmployeeUseCase,
			ListEmployeesUseCase listEmployeesUseCase) {
		this.createEmployeeUseCase = createEmployeeUseCase;
		this.updateEmployeeUseCase = updateEmployeeUseCase;
		this.deleteEmployeeUseCase = deleteEmployeeUseCase;
		this.getEmployeeUseCase = getEmployeeUseCase;
		this.listEmployeesUseCase = listEmployeesUseCase;
	}

	private static final Set<String> SORTABLE_PROPERTIES = Set.of("name", "email", "role", "salary", "hireDate");

	@GetMapping
	public PagedResponse<EmployeeResponse> list(
			@RequestParam(required = false) String role,
			@RequestParam(required = false) String search,
			@PageableDefault(size = 10, sort = "name") Pageable pageable) {
		validateSort(pageable.getSort());
		return PagedResponse.from(listEmployeesUseCase.list(role, search, pageable), EmployeeResponse::from);
	}

	private void validateSort(Sort sort) {
		boolean hasInvalidProperty = sort.stream().anyMatch(order -> !SORTABLE_PROPERTIES.contains(order.getProperty()));
		if (hasInvalidProperty) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Campo de ordenação inválido");
		}
	}

	@GetMapping("/{id}")
	public EmployeeResponse getById(@PathVariable UUID id) {
		return EmployeeResponse.from(getEmployeeUseCase.getById(id));
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
		return EmployeeResponse.from(createEmployeeUseCase.create(request.toDomain()));
	}

	@PutMapping("/{id}")
	public EmployeeResponse update(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
		return EmployeeResponse.from(updateEmployeeUseCase.update(id, request.toDomain()));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable UUID id) {
		deleteEmployeeUseCase.delete(id);
		return ResponseEntity.noContent().build();
	}
}
