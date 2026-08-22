package br.com.itau.funcionarios.employee.adapter.input.web;

import br.com.itau.funcionarios.employee.adapter.input.web.dto.EmployeeRequest;
import br.com.itau.funcionarios.employee.adapter.input.web.dto.EmployeeResponse;
import br.com.itau.funcionarios.employee.port.input.CreateEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.DeleteEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.GetEmployeeUseCase;
import br.com.itau.funcionarios.employee.port.input.ListEmployeesUseCase;
import br.com.itau.funcionarios.employee.port.input.UpdateEmployeeUseCase;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
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

	@GetMapping
	public List<EmployeeResponse> list(@RequestParam(required = false) String role) {
		return listEmployeesUseCase.list(role).stream()
				.map(EmployeeResponse::from)
				.toList();
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
